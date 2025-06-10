using System.Security.Claims;
using System.Threading.Tasks;

namespace TayinAspApi.Services
{
    public class AdminCheckService
    {
        public Task<bool> IsUserAdmin(ClaimsPrincipal user)
        {
            // JWT tokenınızda "role" claim'i "Admin" olarak geliyorsa çalışacak.
            return Task.FromResult(user.IsInRole("Admin"));
        }
    }
}