using System.Threading.Tasks;

namespace TayinAspApi.Services
{
    public interface ILoggingService
    {
        Task LogAsync(string logLevel, string message, string? username = null, string? action = null, string? details = null);
        Task LogInformationAsync(string message, string? username = null, string? action = null, string? details = null);
        Task LogWarningAsync(string message, string? username = null, string? action = null, string? details = null);
        Task LogErrorAsync(string message, string? username = null, string? action = null, string? details = null);
    }
}