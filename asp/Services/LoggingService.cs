// Services/LoggingService.cs
using System;
using System.Threading.Tasks;
using TayinAspApi.Data;
using TayinAspApi.Models;

namespace TayinAspApi.Services
{
    public class LoggingService : ILoggingService
    {
        private readonly ApplicationDbContext _context;

        public LoggingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(string logLevel, string message, string? username = null, string? action = null, string? details = null)
        {
            var log = new AppLog
            {
                Timestamp = DateTime.UtcNow,
                LogLevel = logLevel,
                Message = message,
                Username = username,
                Action = action,
                Details = details
            };

            await _context.AppLogs.AddAsync(log);
            await _context.SaveChangesAsync();
        }

        public Task LogInformationAsync(string message, string? username = null, string? action = null, string? details = null)
        {
            return LogAsync("Information", message, username, action, details);
        }

        public Task LogWarningAsync(string message, string? username = null, string? action = null, string? details = null)
        {
            return LogAsync("Warning", message, username, action, details);
        }

        public Task LogErrorAsync(string message, string? username = null, string? action = null, string? details = null)
        {
            return LogAsync("Error", message, username, action, details);
        }
    }
}