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
        Schema::create('logs', function (Blueprint $table) {
            $table->id();
            $table->timestamp('timestamp')->useCurrent(); // Log'un oluşturulduğu zaman
            $table->string('log_level', 50); // Bilgi, Uyarı, Hata gibi seviyeler
            $table->text('message'); // Log mesajı
            $table->string('username')->nullable(); // Giriş yapan kullanıcının adı/sicil numarası
            $table->string('action')->nullable(); // Hangi işlemin yapıldığı (örn: "User Login", "Data Update")
            $table->longText('details')->nullable(); // Ek detaylar (örn: hata mesajları, istek payload'ları)
            $table->timestamps(); // created_at ve updated_at sütunları
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};
