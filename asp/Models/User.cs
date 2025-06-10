// Models/User.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayinAspApi.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Ad alanı zorunludur.")]
        [StringLength(255, ErrorMessage = "Ad en fazla 255 karakter olmalıdır.")]
        public string Name { get; set; } = null!; 

        [Required(ErrorMessage = "Sicil alanı zorunludur.")]
        [Range(1, int.MaxValue, ErrorMessage = "Sicil alanı pozitif bir sayı olmalıdır.")]
        public int Sicil { get; set; }

        [Required(ErrorMessage = "Şifre alanı zorunludur.")]
        [StringLength(255, MinimumLength = 6, ErrorMessage = "Şifre en az 6, en fazla 255 karakter olmalıdır.")]
        public string Password { get; set; } = null!; 

        [StringLength(20, ErrorMessage = "Telefon numarası en fazla 20 karakter olmalıdır.")]
        public string? Telefon { get; set; } 

        public bool IsAdmin { get; set; } = false; 

        public int? MevcutAdliyeId { get; set; }
        [ForeignKey("MevcutAdliyeId")]
        public Adliye? MevcutAdliye { get; set; } 

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}