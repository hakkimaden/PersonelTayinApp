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

}
