using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly AppDbContext _context;

    public ChatHub(AppDbContext context)
    {
        _context = context;
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private Guid GetUserId() =>
        Guid.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private async Task<ChatConversation> GetConversationOrThrow(Guid convId, Guid userId)
    {
        var conv = await _context.ChatConversations.FindAsync(convId)
            ?? throw new HubException("Conversation not found.");
        if (conv.ClientId != userId && conv.ProviderUserId != userId)
            throw new HubException("Access denied.");
        return conv;
    }

    // ─── Group management ──────────────────────────────────────────────────────

    /// <summary>Join a conversation's SignalR group (also used to receive call signals).</summary>
    public async Task JoinConversation(string conversationId)
    {
        var userId = GetUserId();
        if (!Guid.TryParse(conversationId, out var convId))
            throw new HubException("Invalid conversation ID.");

        await GetConversationOrThrow(convId, userId);
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
    }

    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
    }

    // ─── Messaging ─────────────────────────────────────────────────────────────

    /// <summary>
    /// Send a text or media message.  
    /// For media, pass the Cloudinary URL as <paramref name="fileUrl"/> and set <paramref name="messageType"/>
    /// to "audio" | "image" | "video" | "file".
    /// </summary>
    public async Task SendMessage(
        string conversationId,
        string content,
        string messageType = "text",
        string? fileUrl    = null,
        string? fileName   = null,
        long?   fileSize   = null)
    {
        if (string.IsNullOrWhiteSpace(content) && string.IsNullOrWhiteSpace(fileUrl))
            throw new HubException("Message cannot be empty.");

        var userId = GetUserId();
        if (!Guid.TryParse(conversationId, out var convId))
            throw new HubException("Invalid conversation ID.");

        await GetConversationOrThrow(convId, userId);
        var sender = await _context.Users.FindAsync(userId);

        var message = new ChatMessage
        {
            ConversationId = convId,
            SenderId       = userId,
            Content        = content.Trim(),
            SentAt         = DateTime.UtcNow,
            MessageType    = messageType,
            FileUrl        = fileUrl,
            FileName       = fileName,
            FileSize       = fileSize,
        };

        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync();

        await Clients.Group(conversationId).SendAsync("ReceiveMessage", new
        {
            message.Id,
            message.ConversationId,
            message.SenderId,
            SenderName   = sender?.Name ?? "Unknown",
            message.Content,
            message.SentAt,
            message.IsRead,
            message.MessageType,
            message.FileUrl,
            message.FileName,
            message.FileSize,
        });
    }

    // ─── Read receipts ─────────────────────────────────────────────────────────

    public async Task MarkRead(string conversationId)
    {
        var userId = GetUserId();
        if (!Guid.TryParse(conversationId, out var convId))
            throw new HubException("Invalid conversation ID.");

        await GetConversationOrThrow(convId, userId);

        var unread = await _context.ChatMessages
            .Where(m => m.ConversationId == convId && m.SenderId != userId && !m.IsRead)
            .ToListAsync();

        foreach (var m in unread) m.IsRead = true;
        await _context.SaveChangesAsync();

        await Clients.Group(conversationId).SendAsync("MessagesRead",
            new { conversationId, readById = userId });
    }

    // ─── WebRTC signaling ──────────────────────────────────────────────────────

    /// <summary>Caller initiates a call — rings the other user in the conversation.</summary>
    public async Task InitiateCall(string conversationId, string callType) // callType: "audio" | "video"
    {
        var userId = GetUserId();
        if (!Guid.TryParse(conversationId, out var convId))
            throw new HubException("Invalid conversation ID.");

        await GetConversationOrThrow(convId, userId);
        var caller = await _context.Users.FindAsync(userId);

        // Broadcast to the OTHER party in the conversation (group minus self)
        await Clients.OthersInGroup(conversationId).SendAsync("IncomingCall", new
        {
            conversationId,
            callType,
            callerId   = userId,
            callerName = caller?.Name ?? "Unknown",
        });
    }

    /// <summary>Relay a WebRTC SDP offer to the other party.</summary>
    public async Task SendOffer(string conversationId, string sdpOffer)
    {
        await Clients.OthersInGroup(conversationId).SendAsync("ReceiveOffer", new { conversationId, sdpOffer });
    }

    /// <summary>Relay a WebRTC SDP answer back to the caller.</summary>
    public async Task SendAnswer(string conversationId, string sdpAnswer)
    {
        await Clients.OthersInGroup(conversationId).SendAsync("ReceiveAnswer", new { conversationId, sdpAnswer });
    }

    /// <summary>Relay an ICE candidate to the other party for NAT traversal.</summary>
    public async Task SendIceCandidate(string conversationId, string candidate)
    {
        await Clients.OthersInGroup(conversationId).SendAsync("ReceiveIceCandidate", new { conversationId, candidate });
    }

    /// <summary>End the call — notifies both parties to tear down WebRTC connections.</summary>
    public async Task EndCall(string conversationId)
    {
        await Clients.Group(conversationId).SendAsync("CallEnded", new { conversationId });
    }

    /// <summary>Logs a call event (missed, declined, or completed) in the chat history.</summary>
    public async Task LogCall(string conversationId, string callType, string status, int durationSeconds = 0)
    {
        var userId = GetUserId();
        if (!Guid.TryParse(conversationId, out var convId))
            throw new HubException("Invalid conversation ID.");

        await GetConversationOrThrow(convId, userId);
        var sender = await _context.Users.FindAsync(userId);

        string content;
        string messageType;

        if (status == "Missed")
        {
            content = callType == "video" ? "Missed video call" : "Missed voice call";
            messageType = "call_missed";
        }
        else if (status == "Declined")
        {
            content = callType == "video" ? "Declined video call" : "Declined voice call";
            messageType = "call_declined";
        }
        else // Completed
        {
            var minutes = durationSeconds / 60;
            var seconds = durationSeconds % 60;
            var durationStr = minutes > 0 ? $"{minutes}m {seconds}s" : $"{seconds}s";
            content = callType == "video" ? $"Video call ({durationStr})" : $"Voice call ({durationStr})";
            messageType = "call_completed";
        }

        var message = new ChatMessage
        {
            ConversationId = convId,
            SenderId       = userId,
            Content        = content,
            SentAt         = DateTime.UtcNow,
            MessageType    = messageType,
            FileSize       = durationSeconds // Storing duration in seconds inside FileSize
        };

        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync();

        await Clients.Group(conversationId).SendAsync("ReceiveMessage", new
        {
            message.Id,
            message.ConversationId,
            message.SenderId,
            SenderName   = sender?.Name ?? "Unknown",
            message.Content,
            message.SentAt,
            message.IsRead,
            message.MessageType,
            message.FileSize // Duration
        });
    }
}
