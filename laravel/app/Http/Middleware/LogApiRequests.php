<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Log;
use Symfony\Component\HttpFoundation\Response;

class LogApiRequests
{
    public function handle(Request $request, Closure $next): Response
    {
        $username = Auth::check() ? (Auth::user()->name ?? Auth::user()->email ?? Auth::user()->sicil ?? 'Unknown') : 'Guest';
        $path = $request->path();
        $method = $request->method();

        if ($method === 'GET' && str_starts_with($path, 'api/admin/loglar')) {
            return $next($request);
        }

        // İstek gelmeden önce loglama (ActionExecutingContext karşılığı)
        Log::create([
            'timestamp' => now(),
            'log_level' => 'Information',
            'message' => "{$method} isteği '{$path}' adresine alındı.",
            'username' => $username,
            'action' => "{$method} {$path}",
            'details' => json_encode([
                'ip_address' => $request->ip(),
                'request_params' => $request->all(),
            ]),
        ]);

        $response = $next($request);

        $statusCode = $response->getStatusCode();

        if ($statusCode >= 200 && $statusCode < 300) {
            Log::create([
                'timestamp' => now(),
                'log_level' => 'Information',
                'message' => "{$method} isteği '{$path}' başarıyla tamamlandı. (HTTP {$statusCode})",
                'username' => $username,
                'action' => "{$method} {$path}",
                'details' => json_encode(['status_code' => $statusCode]),
            ]);
        } elseif ($statusCode >= 400 && $statusCode >= 500) {
            // İstemci hataları (Validation, Not Found, Unauthorized vb.) VEYA Sunucu hataları
            $logLevel = ($statusCode >= 400 && $statusCode < 500) ? 'Warning' : 'Error';
            Log::create([
                'timestamp' => now(),
                'log_level' => $logLevel,
                'message' => "{$method} isteği '{$path}' " . ($logLevel === 'Warning' ? "bir istemci hatası ile" : "sunucu hatası ile") . " sonuçlandı. (HTTP {$statusCode})",
                'username' => $username,
                'action' => "{$method} {$path}",
                'details' => json_encode([
                    'status_code' => $statusCode,
                    'response' => $response->getContent()
                ]),
            ]);
        }

        return $response;
    }
}
