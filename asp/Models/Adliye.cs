using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using System.Text.Json.Serialization; 

namespace TayinAspApi.Models
{
    public class Adliye
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Adliye adı zorunludur.")]
        [StringLength(255)]
        public string Adi { get; set; } = null!;

        [StringLength(1000)]
        public string? Adres { get; set; }

        [StringLength(2048)]
        public string? HaritaLinki { get; set; }

        [JsonPropertyName("resim_url")] // Frontend'e bu isim dönecek
        [StringLength(2048)]
        public string? ResimUrl { get; set; }

        [JsonPropertyName("personel_sayisi")] // Frontend'e bu isim dönecek
        public int? PersonelSayisi { get; set; }

        [JsonPropertyName("yapim_yili")] // Frontend'e bu isim dönecek
        public int? YapimYili { get; set; }

        [JsonPropertyName("lojman_var_mi")] // Frontend'e bu isim dönecek
        public int? LojmanVarMi { get; set; }

        [JsonPropertyName("cocuk_kresi_var_mi")] // Frontend'e bu isim dönecek
        public int? KresVarMi { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}