using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using System.Security.Claims;
using System.Threading.Tasks;
using TayinAspApi.Services;

namespace TayinAspApi.Filters
{
    public class LogActionFilter : IAsyncActionFilter
    {
        private readonly ILoggingService _loggingService;

        public LogActionFilter(ILoggingService loggingService)
        {
            _loggingService = loggingService;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var controllerName = context.RouteData.Values["controller"]?.ToString();
            var actionName = context.RouteData.Values["action"]?.ToString();
            var userId = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = context.HttpContext.User.FindFirst(ClaimTypes.Name)?.Value;

            bool shouldSkipLogging = (controllerName?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true && actionName?.Equals("GetLogs", StringComparison.OrdinalIgnoreCase) == true);

            if (!shouldSkipLogging)
            {
                // Action çalıştırılmadan önce loglama
                await _loggingService.LogInformationAsync(
                    message: $"'{controllerName}' kontrolcüsünde '{actionName}' eylemi çalıştırılıyor.",
                    username: userName ?? userId ?? "Anonim",
                    action: $"{controllerName}/{actionName}",
                    details: $"İstek URL: {context.HttpContext.Request.Path}"
                );
            }

            var resultContext = await next(); // Action'ı çalıştır

            if (!shouldSkipLogging)
            {
                // Action çalıştırıldıktan sonra loglama (başarılı veya başarısız olmasına göre)
                if (resultContext.Exception != null)
                {
                    // Hata oluştuysa
                    await _loggingService.LogErrorAsync(
                        message: $"'{controllerName}' kontrolcüsünde '{actionName}' eyleminde hata oluştu.",
                        username: userName ?? userId ?? "Anonim",
                        action: $"{controllerName}/{actionName}",
                        details: $"Hata: {resultContext.Exception.Message}\nStackTrace: {resultContext.Exception.StackTrace}"
                    );
                }
                else if (resultContext.Result is Microsoft.AspNetCore.Mvc.ObjectResult objectResult)
                {
                    // İşlem başarılı ve bir sonuç döndürülüyorsa (2xx durum kodları)
                    if (objectResult.StatusCode >= 200 && objectResult.StatusCode < 300)
                    {
                        await _loggingService.LogInformationAsync(
                            message: $"'{controllerName}' kontrolcüsünde '{actionName}' eylemi başarıyla tamamlandı. (HTTP {objectResult.StatusCode})",
                            username: userName ?? userId ?? "Anonim",
                            action: $"{controllerName}/{actionName}",
                            details: $"Yanıt Durumu: {objectResult.StatusCode}"
                        );
                    }
                    else
                    {
                         // Diğer durum kodları (4xx, 5xx)
                         await _loggingService.LogWarningAsync(
                            message: $"'{controllerName}' kontrolcüsünde '{actionName}' eylemi başarısız oldu veya uyarı döndürdü. (HTTP {objectResult.StatusCode})",
                            username: userName ?? userId ?? "Anonim",
                            action: $"{controllerName}/{actionName}",
                            details: $"Yanıt Durumu: {objectResult.StatusCode}"
                        );
                    }
                }
            }
        }
    }
}