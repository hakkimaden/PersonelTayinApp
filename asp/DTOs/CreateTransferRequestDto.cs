using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http; 

namespace TayinAspApi.DTOs
{
    public class CreateTransferRequestDto
    {
        [Required(ErrorMessage = "Tayin talebi türü seçmek zorunludur.")]
        public string TransferType { get; set; } = null!;

        [Required(ErrorMessage = "En az bir adliye seçmelisiniz.")]
        [MinLength(1, ErrorMessage = "En az bir adliye seçmelisiniz.")]
        public List<int> RequestedAdliyeIds { get; set; } = new List<int>();

        [Required(ErrorMessage = "Gerekçe alanı zorunludur.")]
        [StringLength(1000, ErrorMessage = "Gerekçe en fazla 1000 karakter olmalıdır.")]
        public string Reason { get; set; } = null!;

        public IFormFile? Documents { get; set; } 
    }
}