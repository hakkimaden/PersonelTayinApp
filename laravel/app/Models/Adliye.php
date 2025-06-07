<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Adliye extends Model
{
    use HasFactory;

    protected $fillable = [
        'adi',
        'adres',
        'harita_linki',
        'resim_url',
        'personel_sayisi',
        'yapim_yili',
    ];

    // İsteğe bağlı: Her adliyenin hangi şehirde olduğunu belirtmek için
    // Belki bir 'city_id' alanı ekleyip City modeliyle ilişkilendirebilirsiniz.
}
