<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransferRequest extends Model
{
    use HasFactory;


    protected $fillable = [
            'user_id',
            'current_adliye_id',
            'requested_adliye_ids',
            'reason',
            'document_path',
            'status',
        ];

     protected $casts = [
        'requested_adliye_ids' => 'array',
    ];

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
        $requestedIds = is_string($this->requested_adliye_ids)
                        ? json_decode($this->requested_adliye_ids, true)
                        : $this->requested_adliye_ids;

        if (empty($requestedIds) || !is_array($requestedIds)) {
            return [];
        }

        return Adliye::whereIn('id', $requestedIds)->pluck('adi', 'id')->toArray();
    }




}
