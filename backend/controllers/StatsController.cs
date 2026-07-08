using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly AppDbContext _context;

    public StatsController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/Stats  — public, no auth required
    [HttpGet]
    public async Task<IActionResult> GetStats()
    {
        var providerCount = await _context.ServiceProviders.CountAsync();
        var completedBookingsCount = await _context.Bookings
            .CountAsync(b => b.Status == "Completed");

        return Ok(new
        {
            providerCount,
            completedBookingsCount,
        });
    }
}
