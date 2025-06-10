<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;

    protected $fillable = [
        'timestamp',
        'log_level',
        'message',
        'username',
        'action',
        'details',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
    ];




}
