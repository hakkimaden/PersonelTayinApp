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
        Schema::create('adliyes', function (Blueprint $table) {
            $table->id();
            $table->string('adi'); // Örneğin: "Ankara"
            $table->string('adres')->nullable();
            $table->string('harita_linki')->nullable(); // Google Maps embed linki veya koordinatlar
            $table->string('resim_url')->nullable(); // Adliye binasının resminin URL'si
            $table->integer('personel_sayisi')->nullable(); // Tahmini personel sayısı
            $table->integer('yapim_yili')->nullable(); // Yapım tarihi
            $table->integer('lojman_var_mi')->nullable(); // Lojman var mı? (1: Evet, 0: Hayır)
            $table->integer('kres_var_mi')->nullable(); // Kreş var mı? (1: Evet, 0: Hayır)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adliyes');
    }
};
