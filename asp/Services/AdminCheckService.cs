// Services/AdminCheckService.cs
using System.Security.Claims;
using System.Threading.Tasks;

namespace TayinAspApi.Services
{
    public class AdminCheckService
    {
        public Task<bool> IsUserAdmin(ClaimsPrincipal user)
        {
            // JWT tokenınızda "role" claim'i "Admin" olarak geliyorsa bu doğru çalışır.
            // Eğer farklı bir claim türü kullanıyorsanız (örn: ClaimTypes.Role),
            // onu kullanmanız gerekir. Genellikle "role" string'i yeterlidir.
            return Task.FromResult(user.IsInRole("Admin"));
        }
    }
}