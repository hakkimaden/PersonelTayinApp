using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TayinAspApi.Data;
using TayinAspApi.Models;
using TayinAspApi.Services;
using System.Security.Claims;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Text.Json;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System.Text.Json.Serialization;

namespace TayinAspApi.Controllers
{
    [Route("api/transfer-requests")]
    [ApiController]
    [Authorize]
    public class TransferRequestsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly AdminCheckService _adminCheckService;

        public TransferRequestsController(ApplicationDbContext context, IWebHostEnvironment env, AdminCheckService adminCheckService)
        {
            _context = context;
            _env = env;
            _adminCheckService = adminCheckService;
        }

        // DTO'lar (Data Transfer Objects)
        public class CreateTransferRequestDto
        {
            [Required(ErrorMessage = "Tayin talebi türü seçmek zorunludur.")]
            [RegularExpression("^(Aile Birliği|Sağlık|Eğitim|Diğer)$", ErrorMessage = "Geçersiz bir tayin talebi türü seçildi.")]
            public string TransferType { get; set; } = null!;

            [Required(ErrorMessage = "Tayin olmak istediğiniz en az bir adliye seçmek zorunludur.")]
            [MinLength(1, ErrorMessage = "En az bir adliye seçmelisiniz.")]
            public List<int> RequestedAdliyeIds { get; set; } = new List<int>();

            [Required(ErrorMessage = "Tayin gerekçesi boş bırakılamaz.")]
            [StringLength(1000, ErrorMessage = "Gerekçe en fazla 1000 karakter olabilir.")]
            public string Reason { get; set; } = null!;

            public IFormFile? Documents { get; set; }
        }

        public class TransferRequestResponseDto
        {
            [JsonPropertyName("id")]
            public int Id { get; set; }

            [JsonPropertyName("user_id")]
            public int UserId { get; set; }

            [JsonPropertyName("transfer_type")]
            public string TransferType { get; set; } = null!;

            [JsonPropertyName("requested_adliye_ids")]
            public List<int> RequestedAdliyeIds { get; set; } = new List<int>();

            [JsonPropertyName("requested_adliye_names")]
            public List<string> RequestedAdliyeNames { get; set; } = new List<string>();

            [JsonPropertyName("documents_path")]
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

        public class AdliyeResponseDto
        {
            [JsonPropertyName("id")]
            public int Id { get; set; }

            [JsonPropertyName("adi")]
            public string Adi { get; set; } = null!;
        }

        // GET: api/transfer-requests
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransferRequestResponseDto>>> GetUserTransferRequests()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı." });
            }

            var user = await _context.Users
                                     .Include(u => u.MevcutAdliye)
                                     .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new { message = "Kullanıcı bulunamadı." });
            }

            var requests = await _context.TransferRequests
                                         .Where(tr => tr.UserId == userId)
                                         .Include(tr => tr.CurrentAdliye)
                                         .OrderByDescending(tr => tr.CreatedAt)
                                         .ToListAsync();

            var allRequestedAdliyeIds = requests.SelectMany(r => r.RequestedAdliyeIds).Distinct().ToList();
            var requestedAdliyesMap = await _context.Adliyes
                                                    .Where(a => allRequestedAdliyeIds.Contains(a.Id))
                                                    .ToDictionaryAsync(a => a.Id, a => a.Adi);

    

            var responseDtos = new List<TransferRequestResponseDto>();
            foreach (var requestItem in requests)
            {
                var requestedAdliyeNamesList = requestItem.RequestedAdliyeIds
                                                            .Select(id => requestedAdliyesMap.GetValueOrDefault(id, "Bilinmeyen Adliye"))
                                                            .ToList();

                AdliyeResponseDto? currentAdliyeDto = null;
                if (requestItem.CurrentAdliye != null)
                {
                    currentAdliyeDto = new AdliyeResponseDto { Id = requestItem.CurrentAdliye.Id, Adi = requestItem.CurrentAdliye.Adi };
                }
                else if (user.MevcutAdliye != null)
                {
                    currentAdliyeDto = new AdliyeResponseDto { Id = user.MevcutAdliye.Id, Adi = user.MevcutAdliye.Adi };
                }

                responseDtos.Add(new TransferRequestResponseDto
                {
                    Id = requestItem.Id,
                    UserId = requestItem.UserId,
                    TransferType = requestItem.TransferType,
                    RequestedAdliyeIds = requestItem.RequestedAdliyeIds,
                    RequestedAdliyeNames = requestedAdliyeNamesList,
                    DocumentsPath = requestItem.DocumentsPath,
                    Reason = requestItem.Reason,
                    Status = requestItem.Status,
                    CurrentAdliyeId = requestItem.CurrentAdliyeId,
                    CurrentAdliye = currentAdliyeDto,
                    CreatedAt = requestItem.CreatedAt,
                    UpdatedAt = requestItem.UpdatedAt
                });
            }

            return Ok(responseDtos);
        }

        // GET: api/transfer-requests/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TransferRequestResponseDto>> GetTransferRequest(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı." });
            }

            var user = await _context.Users
                                     .Include(u => u.MevcutAdliye)
                                     .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new { message = "Kullanıcı bulunamadı." });
            }

            var transferRequest = await _context.TransferRequests
                                                .Include(tr => tr.CurrentAdliye)
                                                .FirstOrDefaultAsync(tr => tr.Id == id);

            if (transferRequest == null)
            {
                return NotFound(new { message = "Talep bulunamadı." });
            }

            if (transferRequest.UserId != userId)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = "Bu talebi görüntüleme yetkiniz yok." });
            }

            var requestedAdliyesMap = await _context.Adliyes
                                                    .Where(a => transferRequest.RequestedAdliyeIds.Contains(a.Id))
                                                    .ToDictionaryAsync(a => a.Id, a => a.Adi);

            var requestedAdliyeNamesList = transferRequest.RequestedAdliyeIds
                                                            .Select(adliyeId => requestedAdliyesMap.GetValueOrDefault(adliyeId, "Bilinmeyen Adliye"))
                                                            .ToList();

            AdliyeResponseDto? currentAdliyeDto = null;
            if (transferRequest.CurrentAdliye != null)
            {
                currentAdliyeDto = new AdliyeResponseDto { Id = transferRequest.CurrentAdliye.Id, Adi = transferRequest.CurrentAdliye.Adi };
            }
            else if (user.MevcutAdliye != null)
            {
                currentAdliyeDto = new AdliyeResponseDto { Id = user.MevcutAdliye.Id, Adi = user.MevcutAdliye.Adi };
            }

            var responseDto = new TransferRequestResponseDto
            {
                Id = transferRequest.Id,
                UserId = transferRequest.UserId,
                TransferType = transferRequest.TransferType,
                RequestedAdliyeIds = transferRequest.RequestedAdliyeIds,
                RequestedAdliyeNames = requestedAdliyeNamesList,
                DocumentsPath = transferRequest.DocumentsPath,
                Reason = transferRequest.Reason,
                Status = transferRequest.Status,
                CurrentAdliyeId = transferRequest.CurrentAdliyeId,
                CurrentAdliye = currentAdliyeDto,
                CreatedAt = transferRequest.CreatedAt,
                UpdatedAt = transferRequest.UpdatedAt
            };

            return Ok(responseDto);
        }

        // POST: api/transfer-requests
        [HttpPost]
        public async Task<IActionResult> CreateTransferRequest(
            [FromForm] string transfer_type,
            [FromForm(Name = "requested_adliye_ids[]")] List<int> requested_adliye_ids,
            [FromForm] string reason,
            IFormFile? documents
        )
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı. Lütfen giriş yapın." });
            }

            var user = await _context.Users
                                     .Include(u => u.MevcutAdliye)
                                     .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new { message = "Kullanıcı bulunamadı." });
            }

            var model = new CreateTransferRequestDto
            {
                TransferType = transfer_type,
                RequestedAdliyeIds = requested_adliye_ids,
                Reason = reason,
                Documents = documents
            };

            var validationContext = new ValidationContext(model, serviceProvider: null, items: null);
            var validationResults = new List<ValidationResult>();
            bool isValid = Validator.TryValidateObject(model, validationContext, validationResults, validateAllProperties: true);

            if (!isValid)
            {
                var errors = validationResults.ToDictionary(
                    vr => vr.MemberNames.FirstOrDefault() ?? "Genel",
                    vr => new string[] { vr.ErrorMessage! }
                );
                return BadRequest(new { message = "Bir veya daha fazla doğrulama hatası oluştu.", errors = errors });
            }

            string? documentsPath = null;
            if (model.Documents != null && model.Documents.Length > 0)
            {
                
                var rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var uploadsFolder = Path.Combine(rootPath, "uploads");

                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + model.Documents.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName); 
                
                try
                {
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await model.Documents.CopyToAsync(stream);
                    }
                    documentsPath = "/uploads/" + uniqueFileName;
                }
                catch (Exception ex)
                {
                    // Dosya kaydetme hatasını yakala ve logla
                    return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Belge kaydedilirken bir hata oluştu.", error = ex.Message });
                }
            }

            var requestedAdliyeIdsJson = JsonSerializer.Serialize(model.RequestedAdliyeIds);

            var transferRequest = new TransferRequest
            {
                UserId = userId,
                TransferType = model.TransferType,
                Reason = model.Reason,
                DocumentsPath = documentsPath,
                RequestedAdliyeIdsJson = requestedAdliyeIdsJson,
                Status = "pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CurrentAdliyeId = user.MevcutAdliyeId
            };

            _context.TransferRequests.Add(transferRequest);
            await _context.SaveChangesAsync();

            AdliyeResponseDto? currentAdliyeDto = null;
            if (user.MevcutAdliye != null)
            {
                currentAdliyeDto = new AdliyeResponseDto { Id = user.MevcutAdliye.Id, Adi = user.MevcutAdliye.Adi };
            }

            var createdRequestResponseDto = new TransferRequestResponseDto
            {
                Id = transferRequest.Id,
                UserId = transferRequest.UserId,
                TransferType = transferRequest.TransferType,
                RequestedAdliyeIds = transferRequest.RequestedAdliyeIds,
                RequestedAdliyeNames = new List<string>(),
                DocumentsPath = transferRequest.DocumentsPath,
                Reason = transferRequest.Reason,
                Status = transferRequest.Status,
                CurrentAdliyeId = transferRequest.CurrentAdliyeId,
                CurrentAdliye = currentAdliyeDto,
                CreatedAt = transferRequest.CreatedAt,
                UpdatedAt = transferRequest.UpdatedAt
            };

            return StatusCode(201, new { message = "Tayin talebiniz başarıyla oluşturuldu.", request = createdRequestResponseDto });
        }

        // DELETE: api/transfer-requests/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransferRequest(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı." });
            }

            var transferRequest = await _context.TransferRequests.FindAsync(id);
            if (transferRequest == null)
            {
                return NotFound(new { message = "Talep bulunamadı." });
            }

            if (transferRequest.UserId != userId)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = "Bu talebi silme yetkiniz yok." });
            }

            if (!string.IsNullOrEmpty(transferRequest.DocumentsPath))
            {
                // WebRootPath null ise, uygulamanın çalıştığı dizini kullan
                var rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var filePath = Path.Combine(rootPath, transferRequest.DocumentsPath.TrimStart('/'));
                
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            _context.TransferRequests.Remove(transferRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tayin talebi başarıyla silindi." });
        }
    }
}