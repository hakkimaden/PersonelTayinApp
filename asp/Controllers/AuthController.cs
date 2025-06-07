using Microsoft.AspNetCore.Mvc;
using TayinAspApi.Models;
using TayinAspApi.Data;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Identity; // IPasswordHasher için
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization; // JsonPropertyName için eklendi

namespace TayinAspApi.Controllers
{
    [Route("api")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AuthController(ApplicationDbContext context, IConfiguration configuration, IPasswordHasher<User> passwordHasher)
        {
            _context = context;
            _configuration = configuration;
            _passwordHasher = passwordHasher;
        }

        // DTO'lar (Data Transfer Objects)
        public class RegisterDto
        {
            [Required(ErrorMessage = "Ad Soyad alanı zorunludur.")]
            [StringLength(255, ErrorMessage = "Ad Soyad en fazla 255 karakter olabilir.")]
            public string Name { get; set; } = null!;

            [Required(ErrorMessage = "Sicil numarası alanı zorunludur.")]
            [Range(10000, 999999999999999999, ErrorMessage = "Sicil numarası 5 ile 20 hane arasında olmalıdır.")]
            public int Sicil { get; set; }

            [Required(ErrorMessage = "Telefon numarası alanı zorunludur.")]
            [RegularExpression(@"^(0?\d{10})$", ErrorMessage = "Telefon numarası geçerli bir formatta olmalı (ör: 05XXXXXXXXX veya 5XXXXXXXXX).")]
            public string Phone { get; set; } = null!;

            [Required(ErrorMessage = "Çalıştığınız Adliye alanı zorunludur.")]
            [System.Text.Json.Serialization.JsonPropertyName("current_adliye_id")]
            public int CurrentAdliyeId { get; set; }

            [Required(ErrorMessage = "Şifre alanı zorunludur.")]
            [MinLength(8, ErrorMessage = "Şifre en az 8 karakter olmalıdır.")]
            public string Password { get; set; } = null!;

            [System.Text.Json.Serialization.JsonPropertyName("password_confirmation")]
            [Compare("Password", ErrorMessage = "Şifre tekrarı eşleşmiyor.")]
            public string PasswordConfirmation { get; set; } = null!;
        }
        public class LoginDto
        {
            [Required(ErrorMessage = "Sicil numarası alanı zorunludur.")]
            public int Sicil { get; set; }

            [Required(ErrorMessage = "Şifre alanı zorunludur.")]
            public string Password { get; set; } = null!;
        }
        
        public class UserProfileDto
        {
            [JsonPropertyName("id")]
            public int Id { get; set; }
            [JsonPropertyName("name")]
            public string Name { get; set; } = null!;
            [JsonPropertyName("sicil")]
            public int Sicil { get; set; }
            [JsonPropertyName("telefon")]
            public string? Telefon { get; set; }
            [JsonPropertyName("mevcut_adliye_id")]
            public int? MevcutAdliyeId { get; set; }
            [JsonPropertyName("mevcut_adliye")]
            public Adliye? MevcutAdliye { get; set; } // Adliye modeli de DTO'ya eklenebilir veya Adliye için ayrı bir DTO kullanılabilir
            [JsonPropertyName("is_admin")] // Admin olup olmadığını döndürmek için
            public bool IsAdmin { get; set; }
            // Şifre gibi hassas bilgileri buraya eklemeyin
        }


        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim("sicil", user.Sicil.ToString())
            };

            if (user.IsAdmin)
            {
                claims.Add(new Claim(ClaimTypes.Role, "Admin"));
            }
            else
            {
                claims.Add(new Claim(ClaimTypes.Role, "User")); 
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiryMinutes"]!)),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors)
                                              .Select(e => e.ErrorMessage)
                                              .ToList();
                var firstError = errors.FirstOrDefault() ?? "Lütfen girdiğiniz bilgileri kontrol edin.";
                
                // Sicil veya telefon numarasının zaten kayıtlı olup olmadığını kontrol et
                if (await _context.Users.AnyAsync(u => u.Sicil == model.Sicil))
                {
                    return Conflict(new { message = "Bu sicil numarası zaten sisteme kayıtlı.", errors = ModelState });
                }
                if (await _context.Users.AnyAsync(u => u.Telefon == model.Phone))
                {
                    return Conflict(new { message = "Bu telefon numarası zaten sisteme kayıtlı.", errors = ModelState });
                }

                return BadRequest(new { message = firstError, errors = ModelState });
            }

            // Mevcut adliyenin varlığını kontrol et
            var adliyeExists = await _context.Adliyes.AnyAsync(a => a.Id == model.CurrentAdliyeId);
            if (!adliyeExists)
            {
                ModelState.AddModelError("current_adliye_id", "Seçilen adliye bulunamadı.");
                return BadRequest(new { message = "Seçilen adliye bulunamadı.", errors = ModelState });
            }

            var user = new User
            {
                Name = model.Name,
                Sicil = model.Sicil,
                Telefon = model.Phone,
                MevcutAdliyeId = model.CurrentAdliyeId,
                // IsAdmin varsayılan olarak false gelecek. Admin yapmak isterseniz ayrı bir admin paneli üzerinden yapmalısınız.
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            user.Password = _passwordHasher.HashPassword(user, model.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var loggedInUser = await _context.Users
                                             .Include(u => u.MevcutAdliye)
                                             .FirstOrDefaultAsync(u => u.Sicil == model.Sicil);

            if (loggedInUser != null && _passwordHasher.VerifyHashedPassword(loggedInUser, loggedInUser.Password, model.Password) == PasswordVerificationResult.Success)
            {
                var token = GenerateJwtToken(loggedInUser);
                return Created("register", new
                {
                    message = "Kayıt ve giriş başarıyla tamamlandı.",
                    access_token = token,
                    token_type = "Bearer",
                    user = new UserProfileDto // UserProfileDto kullanarak döndür
                    {
                        Id = loggedInUser.Id,
                        Name = loggedInUser.Name,
                        Sicil = loggedInUser.Sicil,
                        Telefon = loggedInUser.Telefon,
                        MevcutAdliyeId = loggedInUser.MevcutAdliyeId,
                        MevcutAdliye = loggedInUser.MevcutAdliye,
                        IsAdmin = loggedInUser.IsAdmin // IsAdmin bilgisini de döndür
                    }
                });
            }

            return Created("register", new
            {
                message = "Kayıt başarıyla tamamlandı, ancak otomatik giriş yapılamadı. Lütfen manuel olarak giriş yapın.",
                user = new UserProfileDto // UserProfileDto kullanarak döndür
                {
                    Id = user.Id,
                    Name = user.Name,
                    Sicil = user.Sicil,
                    Telefon = user.Telefon,
                    MevcutAdliyeId = user.MevcutAdliyeId,
                    IsAdmin = user.IsAdmin
                }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors)
                                              .Select(e => e.ErrorMessage)
                                              .ToList();
                var firstError = errors.FirstOrDefault() ?? "Doğrulama hatası.";
                return BadRequest(new { message = firstError, errors = ModelState });
            }

            var user = await _context.Users
                                     .Include(u => u.MevcutAdliye)
                                     .FirstOrDefaultAsync(u => u.Sicil == model.Sicil);

            if (user == null || _passwordHasher.VerifyHashedPassword(user, user.Password, model.Password) == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new { message = "Geçersiz kimlik bilgileri (sicil numarası veya şifre yanlış)." });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                message = "Giriş başarılı.",
                access_token = token,
                token_type = "Bearer",
                user = new UserProfileDto // UserProfileDto kullanarak döndür
                {
                    Id = user.Id,
                    Name = user.Name,
                    Sicil = user.Sicil,
                    Telefon = user.Telefon,
                    MevcutAdliyeId = user.MevcutAdliyeId,
                    MevcutAdliye = user.MevcutAdliye,
                    IsAdmin = user.IsAdmin // IsAdmin bilgisini de döndür
                }
            });
        }

        [HttpGet("user")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _context.Users
                                     .Include(u => u.MevcutAdliye)
                                     .FirstOrDefaultAsync(u => u.Id == int.Parse(userId));

            if (user == null)
            {
                return NotFound("Kullanıcı bulunamadı.");
            }

            // Hassas bilgileri göndermemek için DTO kullan
            var userProfile = new UserProfileDto
            {
                Id = user.Id,
                Name = user.Name,
                Sicil = user.Sicil,
                Telefon = user.Telefon,
                MevcutAdliyeId = user.MevcutAdliyeId,
                MevcutAdliye = user.MevcutAdliye,
                IsAdmin = user.IsAdmin // Frontend'e admin olup olmadığını belirtmek için
            };

            return Ok(userProfile);
        }

        [HttpPost("logout")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public IActionResult Logout()
        {
            return Ok(new { message = "Çıkış başarılı." });
        }
    }
}