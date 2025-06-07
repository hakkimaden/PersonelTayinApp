<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransferRequest extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
            'user_id',
            'current_adliye_id', // BU SATIRIN KESİNLİKLE OLDUĞUNDAN EMİN OLUN!
            'requested_adliye_ids',
            'reason',
            'document_path',
            'status',
        ];

     protected $casts = [
        'requested_adliye_ids' => 'array',
    ];


    /**
     * Get the user that owns the transfer request.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }


     public function currentAdliye()
    {
        return $this->belongsTo(Adliye::class, 'current_adliye_id');
    }


   public function getRequestedAdliyesAttribute()
    {
        // Eğer requested_adliye_ids bir array değilse (hala string ise), JSON olarak parse etmeye çalış
        // Bu, $casts doğru ayarlanmazsa bir güvenlik ağıdır.
        $requestedIds = is_string($this->requested_adliye_ids)
                        ? json_decode($this->requested_adliye_ids, true)
                        : $this->requested_adliye_ids;

        if (empty($requestedIds) || !is_array($requestedIds)) {
            return [];
        }

        // requested_adliye_ids array'indeki tüm ID'ler için Adliye isimlerini çek
        return Adliye::whereIn('id', $requestedIds)->pluck('adi', 'id')->toArray();
    }




}
