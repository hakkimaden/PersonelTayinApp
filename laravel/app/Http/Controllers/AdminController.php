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
    private function checkAdmin()
    {
        if (Auth::check() && Auth::user()->id === 1) {
            return true;
        } else {
            return response()->json(['message' => 'Yetkisiz erişim.'], 403); // 403 Forbidden
        }
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

        // currentAdliye ve user ilişkilerini eager load et
        $requests = TransferRequest::with('currentAdliye', 'user')
                                   ->get()
                                   ->map(function ($request) {
                                       // 'requested_adliyes' accessor'ını JSON çıktısına ekle
                                       $request->append('requested_adliyes');
                                       return $request;
                                   });

        return response()->json(['requests' => $requests]);
    }


    public function updateRequestStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => ['required', 'string', Rule::in(['pending', 'approved', 'rejected'])],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Geçersiz durum değeri.', 'errors' => $validator->errors()], 400);
        }

        $transferRequest = TransferRequest::find($id);

        if (!$transferRequest) {
            return response()->json(['message' => 'Talep bulunamadı.'], 404);
        }

        $transferRequest->status = $request->input('status');
        $transferRequest->save();

        return response()->json(['message' => 'Talep durumu başarıyla güncellendi.', 'request' => $transferRequest], 200);
    }







}
