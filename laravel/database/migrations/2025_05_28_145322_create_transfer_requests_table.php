<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transfer_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Hangi kullanıcının talebi (ilişkisiz)
            $table->unsignedBigInteger('current_adliye_id'); // Çalıştığı adliye (ID) (ilişkisiz)
            $table->json('requested_adliye_ids'); // Talep edilen adliye ID'leri (JSON array olarak saklanacak)
            $table->text('reason');
            $table->string('document_path')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transfer_requests');
    }
};
