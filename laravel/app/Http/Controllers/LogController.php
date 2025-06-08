<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Pagination\LengthAwarePaginator;

class LogController extends Controller
{
    public function index(Request $request)
    {
        // Sadece 'admin' rolüne sahip kullanıcıların erişimini kontrol edin
        if (!Auth::check() || Auth::id() !== 1) {
            return response()->json(['message' => 'Bu kaynağa erişim yetkiniz yok.'], 403);
        }

        $query = Log::query();

        // Filtreleme
        if ($request->filled('log_level')) {
            $query->where('log_level', $request->log_level);
        }
        if ($request->filled('username')) {
            $query->where('username', 'like', '%' . $request->username . '%');
        }
        if ($request->filled('action')) {
            $query->where('action', 'like', '%' . $request->action . '%');
        }
        if ($request->filled('start_date')) {
            $query->where('timestamp', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->where('timestamp', '<=', \Carbon\Carbon::parse($request->end_date)->endOfDay());
        }

        // Sayfalama
        $perPage = $request->input('pageSize', 10); // frontend'deki pageSize ile uyumlu
        $logs = $query->orderByDesc('timestamp')->paginate($perPage);

        // Frontend'in beklediği formatta dönüşüm
        $logDtos = $logs->map(function ($log) {
            // *** BURADA DEĞİŞİKLİK YAPIYORUZ ***
            // "details" alanını JSON string olarak dönüştürüyoruz,
            // ancak eğer boş veya null ise null bırakıyoruz.
            $decodedDetails = json_decode($log->details, true);
            $formattedDetails = $decodedDetails ? json_encode($decodedDetails, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;

            return [
                'id' => $log->id,
                'timestamp' => $log->timestamp->toIso8601String(),
                'log_level' => $log->log_level,
                'message' => $log->message,
                'username' => $log->username,
                'action' => $log->action,
                'details' => $formattedDetails, // Artık bir JSON string
            ];
        });

        return response()->json($logDtos)->header('X-Total-Count', $logs->total());
    }
}
