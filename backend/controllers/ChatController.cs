using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.Data;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public ChatController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config  = config;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── GET /api/chat/conversations ──────────────────────────────────
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var uid = CurrentUserId;

        var conversations = await _context.ChatConversations
            .Where(c => c.ClientId == uid || c.ProviderUserId == uid)
            .Include(c => c.Client)
            .Include(c => c.ProviderUser)
            .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
            .Include(c => c.Booking)
                .ThenInclude(b => b!.Service)
            .Include(c => c.JobApplication)
                .ThenInclude(a => a!.JobPost)
            .OrderByDescending(c => c.Messages.Max(m => (DateTime?)m.SentAt) ?? c.CreatedAt)
            .ToListAsync();

        var result = conversations.Select(c =>
        {
            var lastMsg   = c.Messages.OrderByDescending(m => m.SentAt).FirstOrDefault();
            var unread    = c.Messages.Count(m => m.SenderId != uid && !m.IsRead);
            var otherUser = c.ClientId == uid ? c.ProviderUser : c.Client;
            var subject   = c.BookingId.HasValue
                ? c.Booking?.Service?.Title ?? "Booking"
                : c.JobApplication?.JobPost?.Title ?? "Job";

            return new
            {
                c.Id,
                c.CreatedAt,
                c.BookingId,
                c.JobApplicationId,
                Subject   = subject,
                OtherUser = new { otherUser.Id, otherUser.Name },
                LastMessage = lastMsg == null ? null : new
                {
                    lastMsg.Content,
                    lastMsg.SentAt,
                    lastMsg.SenderId,
                    lastMsg.MessageType,
                },
                UnreadCount = unread
            };
        });

        return Ok(result);
    }

    // ── GET /api/chat/conversations/{id}/messages ─────────────────────
    [HttpGet("conversations/{id}/messages")]
    public async Task<IActionResult> GetMessages(Guid id, [FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        var uid  = CurrentUserId;
        var conv = await _context.ChatConversations.FindAsync(id);

        if (conv == null) return NotFound();
        if (conv.ClientId != uid && conv.ProviderUserId != uid) return Forbid();

        var messages = await _context.ChatMessages
            .Where(m => m.ConversationId == id)
            .Include(m => m.Sender)
            .OrderBy(m => m.SentAt)
            .Skip(skip)
            .Take(take)
            .Select(m => new
            {
                m.Id,
                m.ConversationId,
                m.SenderId,
                SenderName  = m.Sender.Name,
                m.Content,
                m.SentAt,
                m.IsRead,
                m.MessageType,
                m.FileUrl,
                m.FileName,
                m.FileSize,
            })
            .ToListAsync();

        return Ok(messages);
    }

    // ── GET /api/chat/unread-count ────────────────────────────────────
    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount()
    {
        var uid = CurrentUserId;

        var count = await _context.ChatMessages
            .Where(m =>
                m.SenderId != uid &&
                !m.IsRead &&
                (m.Conversation.ClientId == uid || m.Conversation.ProviderUserId == uid))
            .CountAsync();

        return Ok(new { count });
    }

    // ── POST /api/chat/upload ─────────────────────────────────────────
    // Upload any file (audio, image, video, document) to Cloudinary
    // Returns: { url, publicId, resourceType, fileName, fileSize }
    [HttpPost("upload")]
    [RequestSizeLimit(52_428_800)] // 50 MB
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided.");

        var cloudName  = _config["Cloudinary:CloudName"]!;
        var apiKey     = _config["Cloudinary:ApiKey"]!;
        var apiSecret  = _config["Cloudinary:ApiSecret"]!;

        var account    = new Account(cloudName, apiKey, apiSecret);
        var cloudinary = new Cloudinary(account) { Api = { Secure = true } };

        // Determine resource type from MIME
        var mime = file.ContentType.ToLower();
        string resourceType = mime.StartsWith("image/") ? "image"
                            : mime.StartsWith("video/") ? "video"
                            : mime.StartsWith("audio/") ? "video"  // Cloudinary stores audio under "video"
                            : "raw";                                 // documents

        using var stream = file.OpenReadStream();

        var uploadParams = new RawUploadParams
        {
            File           = new FileDescription(file.FileName, stream),
            Folder         = "local-service-finder/chat",
            UseFilename    = true,
            UniqueFilename = true,
        };

        // Use the correct upload API based on resource type
        CloudinaryDotNet.Actions.RawUploadResult uploadResult;
        if (resourceType == "image")
        {
            var imgParams = new ImageUploadParams
            {
                File           = uploadParams.File,
                Folder         = uploadParams.Folder,
                UseFilename    = true,
                UniqueFilename = true,
            };
            var imgResult = await cloudinary.UploadAsync(imgParams);
            if (imgResult.Error != null) return BadRequest(imgResult.Error.Message);
            return Ok(new {
                url          = imgResult.SecureUrl.ToString(),
                publicId     = imgResult.PublicId,
                resourceType = "image",
                fileName     = file.FileName,
                fileSize     = file.Length,
            });
        }
        else if (resourceType == "video")
        {
            var vidParams = new VideoUploadParams
            {
                File           = uploadParams.File,
                Folder         = uploadParams.Folder,
                UseFilename    = true,
                UniqueFilename = true,
            };
            var vidResult = await cloudinary.UploadAsync(vidParams);
            if (vidResult.Error != null) return BadRequest(vidResult.Error.Message);
            // Determine if it was audio or video based on MIME
            var actualType = mime.StartsWith("audio/") ? "audio" : "video";
            return Ok(new {
                url          = vidResult.SecureUrl.ToString(),
                publicId     = vidResult.PublicId,
                resourceType = actualType,
                fileName     = file.FileName,
                fileSize     = file.Length,
            });
        }
        else
        {
            // Raw files (PDF, docx, etc.)
            var rawResult = await cloudinary.UploadAsync(uploadParams);
            if (rawResult.Error != null) return BadRequest(rawResult.Error.Message);
            return Ok(new {
                url          = rawResult.SecureUrl.ToString(),
                publicId     = rawResult.PublicId,
                resourceType = "file",
                fileName     = file.FileName,
                fileSize     = file.Length,
            });
        }
    }
}
