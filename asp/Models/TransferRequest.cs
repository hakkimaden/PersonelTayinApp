// backend/Models/TransferRequest.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json; // JSON serileştirme/deserileştirme için

namespace TayinAspApi.Models
{
    public class TransferRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        [Required(ErrorMessage = "Tayin türü zorunludur.")]
        public string TransferType { get; set; } = null!; // Aile Birliği, Sağlık vb.

        // Bu alan, JSON serileştirilmiş RequestedAdliyeIds'ı tutacak
        [Required(ErrorMessage = "Talep edilen adliyeler zorunludur.")]
        public string RequestedAdliyeIdsJson { get; set; } = null!;

        // JSON serileştirilmiş veriden türetilmiş, EF Core tarafından eşlenmeyecek (NotMapped)
        [NotMapped]
        public List<int> RequestedAdliyeIds
        {
            get => string.IsNullOrEmpty(RequestedAdliyeIdsJson) ? new List<int>() : JsonSerializer.Deserialize<List<int>>(RequestedAdliyeIdsJson)!;
            set => RequestedAdliyeIdsJson = JsonSerializer.Serialize(value);
        }

        // BU KISIM EKLENDİ / KONTROL EDİLDİ
        [NotMapped] // Bu özellik veritabanına eşlenmeyecek
        public Dictionary<int, string> RequestedAdliyeNames { get; set; } = new Dictionary<int, string>(); // DTO'da değil, çıktı/görüntüleme için

        public string? DocumentsPath { get; set; } // Ek belgeler için yol (Veritabanında saklanacak)

        [Required(ErrorMessage = "Gerekçe zorunludur.")]
        [StringLength(1000)]
        public string Reason { get; set; } = null!;

        [Required]
        public string Status { get; set; } = "pending"; // pending, approved, rejected

        public int? CurrentAdliyeId { get; set; } // Kullanıcının talep anındaki adliyesi
        [ForeignKey("CurrentAdliyeId")]
        public Adliye? CurrentAdliye { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}