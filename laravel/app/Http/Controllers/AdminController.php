<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\TransferRequest as TransferRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;


class AdminController extends Controller
{
    // Ortak ID kontrolünü yapacak özel bir metod tanımlayabiliriz
    private function checkAdmin()
    {
        // Auth::user() ile kimliği doğrulanmış kullanıcıyı alırız
        // Eğer kullanıcı yoksa veya ID'si 1 değilse false döner

        return response()->json(['message' => 'Yetkisiz erişim.'], 403); // 403 Forbidden

        return Auth::check() && Auth::user()->id === 1;
    }

    public function getUsers()
    {
        // Admin kontrolü yap
        if (!$this->checkAdmin()) {
            return response()->json(['message' => 'Yetkisiz erişim.'], 403); // 403 Forbidden
        }

        $users = User::with('mevcutAdliye')->get();
        return response()->json(['users' => $users]);
    }

    public function getRequests()
    {
        if (!$this->checkAdmin()) {
            return response()->json(['message' => 'Yetkisiz erişim.'], 403);
        }

        // currentAdliye ve user ilişkilerini eager load (hevesli yükle) et
        $requests = TransferRequest::with('currentAdliye', 'user')
                                   ->get()
                                   ->map(function ($request) {
                                       // 'requested_adliyes' accessor'ını JSON çıktısına ekle
                                       $request->append('requested_adliyes');
                                       return $request;
                                   });

        // dd($requests->toArray()); // Debug için kullanabilirsiniz

        return response()->json(['requests' => $requests]);
    }


    public function updateRequestStatus(Request $request, $id)
    {
        // Validate the incoming request data
        $validator = Validator::make($request->all(), [
            'status' => ['required', 'string', Rule::in(['pending', 'approved', 'rejected'])],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Geçersiz durum değeri.', 'errors' => $validator->errors()], 400);
        }

        $transferRequest = TransferRequest::find($id); // Ensure you're using the correct Request model

        if (!$transferRequest) {
            return response()->json(['message' => 'Talep bulunamadı.'], 404);
        }

        $transferRequest->status = $request->input('status');
        $transferRequest->save();

        return response()->json(['message' => 'Talep durumu başarıyla güncellendi.', 'request' => $transferRequest], 200);
    }







}
