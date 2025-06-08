<?php

namespace App\Traits;

use App\Models\Log;
use Illuminate\Support\Facades\Auth; // Giriş yapan kullanıcıyı almak için

trait Loggable
{
    /**
     * Genel loglama fonksiyonu.
     *
     * @param string $logLevel Log seviyesi (e.g., 'info', 'warning', 'error')
     * @param string $message Log mesajı
     * @param string|null $action Yapılan eylem (e.g., 'User Login', 'Post Created')
     * @param array $details Ek detaylar (dizi olarak)
     * @return void
     */
    public function logActivity(string $logLevel, string $message, ?string $action = null, array $details = []): void
    {
        $username = null;
        if (Auth::check()) {
            // Kullanıcı modelinize göre username'i alın
            // Örneğin: Auth::user()->name veya Auth::user()->sicil
            $username = Auth::user()->name ?? Auth::user()->email ?? Auth::user()->sicil ?? 'Unknown';
        }

        Log::create([
            'timestamp' => now(), // Laravel helper, mevcut zamanı verir
            'log_level' => $logLevel,
            'message' => $message,
            'username' => $username,
            'action' => $action,
            'details' => json_encode($details), // Detayları JSON olarak kaydet
        ]);
    }

    /**
     * Bilgilendirme logu kaydet.
     */
    public function logInfo(string $message, ?string $action = null, array $details = []): void
    {
        $this->logActivity('Information', $message, $action, $details);
    }

    /**
     * Uyarı logu kaydet.
     */
    public function logWarning(string $message, ?string $action = null, array $details = []): void
    {
        $this->logActivity('Warning', $message, $action, $details);
    }

    /**
     * Hata logu kaydet.
     */
    public function logError(string $message, ?string $action = null, array $details = []): void
    {
        $this->logActivity('Error', $message, $action, $details);
    }
}
