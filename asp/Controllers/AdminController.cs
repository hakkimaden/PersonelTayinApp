using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TayinAspApi.Data;
using TayinAspApi.Models;
using TayinAspApi.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http; // StatusCodes için
using System.Text.Json.Serialization; // JsonPropertyName için

namespace TayinAspApi.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Sadece Admin rolüne sahip kullanıcılar erişebilir
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly AdminCheckService _adminCheckService;

        public AdminController(ApplicationDbContext context, AdminCheckService adminCheckService)
        {
            _context = context;
            _adminCheckService = adminCheckService;
        }

        public class AppLogDto
        {
            [JsonPropertyName("id")]
            public int Id { get; set; }

            [JsonPropertyName("timestamp")]
            public DateTime Timestamp { get; set; }

            [JsonPropertyName("log_level")]
            public string LogLevel { get; set; } = null!;

            [JsonPropertyName("message")]
            public string Message { get; set; } = null!;

            [JsonPropertyName("username")]
            public string? Username { get; set; }

            [JsonPropertyName("action")]
            public string? Action { get; set; }

            [JsonPropertyName("details")]
            public string? Details { get; set; }
        }

        // --- DTO'lar (Frontend'in Beklediği Formatlar İçin) ---

        // Frontend'in UserManagementPage.jsx beklentilerine göre güncellenen UserResponseDto
        public class UserResponseDto
        {
            [JsonPropertyName("id")]
            public int Id { get; set; }
            [JsonPropertyName("name")]
            public string Name { get; set; } = null!;
            [JsonPropertyName("sicil")]
            public string Sicil { get; set; } = null!; // Sicil int olduğu için string'e çevireceğiz
            [JsonPropertyName("telefon")] // Frontend'de 'telefon' olarak kullanılıyor
            public string? Telefon { get; set; }
            [JsonPropertyName("mevcut_adliye_id")]
            public int? MevcutAdliyeId { get; set; }
            [JsonPropertyName("mevcut_adliye")] // Frontend mevcut_adliye.adi bekliyor
            public AdliyeResponseDto? MevcutAdliye { get; set; } // Adliye bilgileri için AdliyeResponseDto kullanıyoruz
            [JsonPropertyName("created_at")] // Frontend'de 'created_at' olarak kullanılıyor
            public DateTime CreatedAt { get; set; }
            // 'updated_at' isterseniz ekleyebilirsiniz
        }

        // Adliye bilgilerini döndürmek için DTO
        public class AdliyeResponseDto
        {
            [JsonPropertyName("id")]
            public int Id { get; set; }
            [JsonPropertyName("adi")]
            public string Adi { get; set; } = null!;
            // İl, İlçe gibi diğer adliye bilgileri de eklenebilir eğer frontend'de kullanılıyorsa
        }

        public class AdminTransferRequestResponseDto
        {
            [JsonPropertyName("id")]
            public int Id { get; set; }

            [JsonPropertyName("user_id")]
            public int UserId { get; set; }

            [JsonPropertyName("user")]
            public UserResponseDto? User { get; set; } // Kullanıcı bilgilerini içerecek

            [JsonPropertyName("transfer_type")]
            public string TransferType { get; set; } = null!;

            [JsonPropertyName("requested_adliye_ids")]
            public List<int> RequestedAdliyeIds { get; set; } = new List<int>();

            [JsonPropertyName("requested_adliyes")]
            public Dictionary<int, string> RequestedAdliyeNamesMap { get; set; } = new Dictionary<int, string>();

            [JsonPropertyName("document_path")]
            public string? DocumentsPath { get; set; }

            [JsonPropertyName("reason")]
            public string Reason { get; set; } = null!;

            [JsonPropertyName("status")]
            public string Status { get; set; } = null!;

            [JsonPropertyName("current_adliye_id")]
            public int? CurrentAdliyeId { get; set; }

            [JsonPropertyName("current_adliye")]
            public AdliyeResponseDto? CurrentAdliye { get; set; }

            [JsonPropertyName("created_at")]
            public DateTime CreatedAt { get; set; }

            [JsonPropertyName("updated_at")]
            public DateTime UpdatedAt { get; set; }
        }

        public class UpdateRequestStatusDto
        {
            [Required(ErrorMessage = "Durum alanı zorunludur.")]
            [RegularExpression("^(pending|approved|rejected)$", ErrorMessage = "Geçersiz durum değeri. Durum 'pending', 'approved' veya 'rejected' olmalıdır.")]
            public string Status { get; set; } = null!;
        }

        // GET: api/admin/users
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
        {
            if (!await _adminCheckService.IsUserAdmin(User))
            {
                return Forbid("Bu kaynağa erişim yetkiniz yok.");
            }

            var users = await _context.Users
                                      .Include(u => u.MevcutAdliye) // MevcutAdliye bilgilerini çek
                                      .OrderBy(u => u.Name)
                                      .ToListAsync();

            var userDtos = users.Select(u => new UserResponseDto
            {
                Id = u.Id,
                Name = u.Name ?? "Bilinmiyor",
                Sicil = u.Sicil.ToString(), // int olan Sicil'i string'e çeviriyoruz
                Telefon = u.Telefon, // Telefon zaten string veya nullable string
                MevcutAdliyeId = u.MevcutAdliyeId,
                // MevcutAdliye null ise null bırak, değilse AdliyeResponseDto'ya dönüştür
                MevcutAdliye = u.MevcutAdliye != null ? new AdliyeResponseDto { Id = u.MevcutAdliye.Id, Adi = u.MevcutAdliye.Adi } : null,
                CreatedAt = u.CreatedAt // Kayıt tarihini de ekledik
            }).ToList();

            return Ok(new { users = userDtos });
        }

        // GET: api/admin/requests
        [HttpGet("requests")]
        public async Task<ActionResult<IEnumerable<AdminTransferRequestResponseDto>>> GetRequests()
        {
            if (!await _adminCheckService.IsUserAdmin(User))
            {
                return Forbid("Bu kaynağa erişim yetkiniz yok.");
            }

            var requests = await _context.TransferRequests
                                         .Include(tr => tr.CurrentAdliye)
                                         .Include(tr => tr.User)
                                             .ThenInclude(u => u.MevcutAdliye)
                                         .OrderByDescending(tr => tr.CreatedAt)
                                         .ToListAsync();

            var allRequestedAdliyeIds = requests.SelectMany(r => r.RequestedAdliyeIds).Distinct().ToList();
            var requestedAdliyesMapGlobal = await _context.Adliyes
                                                    .Where(a => allRequestedAdliyeIds.Contains(a.Id))
                                                    .ToDictionaryAsync(a => a.Id, a => a.Adi);

            var responseDtos = new List<AdminTransferRequestResponseDto>();
            foreach (var requestItem in requests)
            {
                var requestedAdliyeNamesForRequest = new Dictionary<int, string>();
                foreach (var id in requestItem.RequestedAdliyeIds)
                {
                    if (requestedAdliyesMapGlobal.TryGetValue(id, out string? adliyeAdi))
                    {
                        requestedAdliyeNamesForRequest.Add(id, adliyeAdi);
                    }
                }

                AdliyeResponseDto? currentAdliyeDto = null;
                if (requestItem.CurrentAdliye != null)
                {
                    currentAdliyeDto = new AdliyeResponseDto { Id = requestItem.CurrentAdliye.Id, Adi = requestItem.CurrentAdliye.Adi };
                }
                else if (requestItem.User?.MevcutAdliye != null)
                {
                    currentAdliyeDto = new AdliyeResponseDto { Id = requestItem.User.MevcutAdliye.Id, Adi = requestItem.User.MevcutAdliye.Adi };
                }

                UserResponseDto? userDto = null;
                if (requestItem.User != null)
                {
                    userDto = new UserResponseDto
                    {
                        Id = requestItem.User.Id,
                        Name = requestItem.User.Name ?? "Bilinmiyor",
                        Sicil = requestItem.User.Sicil.ToString(), // int olan Sicil'i string'e çeviriyoruz
                        Telefon = requestItem.User.Telefon, // Telefon bilgisini de ekledik
                        MevcutAdliyeId = requestItem.User.MevcutAdliyeId, // Mevcut Adliye ID'sini ekledik
                        MevcutAdliye = requestItem.User.MevcutAdliye != null ? new AdliyeResponseDto { Id = requestItem.User.MevcutAdliye.Id, Adi = requestItem.User.MevcutAdliye.Adi } : null, // Mevcut Adliye objesini ekledik
                        CreatedAt = requestItem.User.CreatedAt // CreatedAt bilgisini de ekledik
                    };
                }

                responseDtos.Add(new AdminTransferRequestResponseDto
                {
                    Id = requestItem.Id,
                    UserId = requestItem.UserId,
                    User = userDto,
                    TransferType = requestItem.TransferType,
                    RequestedAdliyeIds = requestItem.RequestedAdliyeIds,
                    RequestedAdliyeNamesMap = requestedAdliyeNamesForRequest,
                    DocumentsPath = requestItem.DocumentsPath,
                    Reason = requestItem.Reason,
                    Status = requestItem.Status,
                    CurrentAdliyeId = requestItem.CurrentAdliyeId,
                    CurrentAdliye = currentAdliyeDto,
                    CreatedAt = requestItem.CreatedAt,
                    UpdatedAt = requestItem.UpdatedAt
                });
            }

            return Ok(new { requests = responseDtos });
        }

        // PUT: api/admin/requests/{id}/status
        [HttpPut("requests/{id}/status")]
        public async Task<IActionResult> UpdateRequestStatus(int id, [FromBody] UpdateRequestStatusDto model)
        {
            if (!await _adminCheckService.IsUserAdmin(User))
            {
                return Forbid("Bu işlemi yapma yetkiniz yok.");
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors)
                                              .Select(e => e.ErrorMessage)
                                              .ToList();
                var firstError = errors.FirstOrDefault() ?? "Geçersiz durum değeri.";
                return BadRequest(new { message = firstError, errors = ModelState });
            }

            var transferRequest = await _context.TransferRequests.FindAsync(id);

            if (transferRequest == null)
            {
                return NotFound(new { message = "Talep bulunamadı." });
            }

            transferRequest.Status = model.Status;
            transferRequest.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Talep durumu başarıyla güncellendi.", request = transferRequest });
        }

        // --- Yeni Eklenecek Log Endpoint'i ---
        [HttpGet("loglar")]
        [Authorize(Roles = "Admin")] // Bu endpoint'in sadece adminler tarafından erişilebilir olduğundan emin olalım
        public async Task<ActionResult<IEnumerable<AppLogDto>>> GetLogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? logLevel = null,
            [FromQuery] string? username = null,
            [FromQuery] string? action = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            if (!await _adminCheckService.IsUserAdmin(User))
            {
                return Forbid("Bu kaynağa erişim yetkiniz yok.");
            }

            IQueryable<AppLog> query = _context.AppLogs;

            // Filtreleme
            if (!string.IsNullOrEmpty(logLevel))
            {
                query = query.Where(l => l.LogLevel == logLevel);
            }
            if (!string.IsNullOrEmpty(username))
            {
                query = query.Where(l => l.Username != null && l.Username.Contains(username));
            }
            if (!string.IsNullOrEmpty(action))
            {
                query = query.Where(l => l.Action != null && l.Action.Contains(action));
            }
            if (startDate.HasValue)
            {
                query = query.Where(l => l.Timestamp >= startDate.Value);
            }
            if (endDate.HasValue)
            {
                // endDate'i günün sonuna kadar dahil etmek için
                query = query.Where(l => l.Timestamp <= endDate.Value.AddDays(1).AddTicks(-1));
            }

            // Toplam kayıt sayısını al (pagination için)
            var totalCount = await query.CountAsync();

            // Sıralama ve sayfalama
            var logs = await query.OrderByDescending(l => l.Timestamp) // En son loglar en başta
                                  .Skip((page - 1) * pageSize)
                                  .Take(pageSize)
                                  .ToListAsync();

            var logDtos = logs.Select(l => new AppLogDto
            {
                Id = l.Id,
                Timestamp = l.Timestamp,
                LogLevel = l.LogLevel,
                Message = l.Message,
                Username = l.Username,
                Action = l.Action,
                Details = l.Details
            }).ToList();

            // Toplam kayıt sayısı ile birlikte logları döndür
            Response.Headers.Append("X-Total-Count", totalCount.ToString());
            return Ok(logDtos);
        }


    }
}