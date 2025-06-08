<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;

    // Doldurulabilir alanlar
    protected $fillable = [
        'timestamp',
        'log_level',
        'message',
        'username',
        'action',
        'details',
    ];

    // Tarih sütunlarının otomatik olarak Carbon nesnesine dönüştürülmesi için
    protected $casts = [
        'timestamp' => 'datetime',
    ];




}
