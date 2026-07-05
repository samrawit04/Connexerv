namespace backend.Models;

public class ChatMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ConversationId { get; set; }
    public ChatConversation Conversation { get; set; } = null!;
    public Guid SenderId { get; set; }
    public User Sender { get; set; } = null!;
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    // Media fields (null for plain text messages)
    public string MessageType { get; set; } = "text"; // text | audio | image | video | file
    public string? FileUrl  { get; set; }
    public string? FileName { get; set; }
    public long?   FileSize { get; set; } // bytes
}
