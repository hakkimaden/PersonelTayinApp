<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;


class AuthController extends Controller
{
    /**
     * Yeni bir kullanıcı kaydı yapar.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
     public function register(Request $request)
    {
        try {
            $request->validate(
                [
                    'name' => ['required', 'string', 'max:255'],
                    'sicil' => ['required', 'string', 'digits_between:5,20', 'unique:users'],
                    'phone' => [
                        'required',
                        'string',
                        'regex:/^(0?\d{10})$/',
                    ],
                    'current_adliye_id' => ['required', 'integer', 'exists:adliyes,id'],
                    'password' => ['required', 'string', 'min:8', 'confirmed'],
                ],
                [
                    'name.required' => 'Ad Soyad alanı zorunludur.',
                    'name.string' => 'Ad Soyad metin formatında olmalıdır.',
                    'name.max' => 'Ad Soyad en fazla 255 karakter olabilir.',

                    'sicil.required' => 'Sicil numarası alanı zorunludur.',
                    'sicil.string' => 'Sicil numarası metin formatında olmalıdır.',
                    'sicil.digits_between' => 'Sicil numarası 5 ile 20 hane arasında olmalıdır.',
                    'sicil.unique' => 'Bu sicil numarası zaten sisteme kayıtlı.',

                    'phone.required' => 'Telefon numarası alanı zorunludur.',
                    'phone.string' => 'Telefon numarası metin formatında olmalıdır.',
                    'phone.regex' => 'Telefon numarası geçerli bir formatta olmalı (ör: 05XXXXXXXXX veya 5XXXXXXXXX).',
                    'phone.unique' => 'Bu telefon numarası zaten sisteme kayıtlı.',

                    'current_adliye_id.required' => 'Çalıştığınız Adliye alanı zorunludur.',
                    'current_adliye_id.integer' => 'Çalıştığınız Adliye ID\'si geçersiz bir formatta.',
                    'current_adliye_id.exists' => 'Seçilen adliye bulunamadı.',

                    'password.required' => 'Şifre alanı zorunludur.',
                    'password.string' => 'Şifre metin formatında olmalıdır.',
                    'password.min' => 'Şifre en az 8 karakter olmalıdır.',
                    'password.confirmed' => 'Şifre tekrarı eşleşmiyor.',
                ]
            );
        } catch (ValidationException $e) {
            $firstSpecificError = collect($e->errors())->flatten()->first();

            if (isset($e->errors()['sicil']) && in_array('Bu sicil numarası zaten sisteme kayıtlı.', $e->errors()['sicil'])) {
                return response()->json([
                    'message' => $firstSpecificError,
                    'errors' => $e->errors()
                ], 409);
            }

            if (isset($e->errors()['phone']) && in_array('Bu telefon numarası zaten sisteme kayıtlı.', $e->errors()['phone'])) {
                return response()->json([
                    'message' => $firstSpecificError,
                    'errors' => $e->errors()
                ], 409);
            }


            return response()->json([
                'message' => $firstSpecificError ?: 'Lütfen girdiğiniz bilgileri kontrol edin.',
                'errors' => $e->errors()
            ], 422);
        }


        $user = User::create([
            'name' => $request->name,
            'sicil' => $request->sicil,
            'telefon' => $request->phone,
            'mevcut_adliye_id' => $request->current_adliye_id,
            'password' => Hash::make($request->password),
        ]);

        if (Auth::attempt(['sicil' => $request->sicil, 'password' => $request->password])) {
            $loggedInUser = $request->user();
            $token = $loggedInUser->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Kayıt ve giriş başarıyla tamamlandı.',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user->load('mevcutAdliye')
            ], 201);
        }

        return response()->json([
            'message' => 'Kayıt başarıyla tamamlandı, ancak otomatik giriş yapılamadı. Lütfen manuel olarak giriş yapın.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'sicil' => $user->sicil,
                'phone' => $user->phone,
                'current_adliye_id' => $user->current_adliye_id,
            ]
        ], 201);
    }



    /**
     * Kullanıcı girişi yapar ve bir Sanctum token'ı döndürür.
     * Bu fonksiyon React uygulamanızda login işlemi için kullanılacaktır.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            // Gelen verileri doğrula
            $request->validate([
                'sicil' => ['required', 'string', 'digits_between:5,20'],
                'password' => ['required', 'string'],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Doğrulama hatası.',
                'errors' => $e->errors()
            ], 422);
        }


        // Kimlik bilgilerini doğrula
        // Auth::attempt metodu, kullanıcıyı kimlik bilgileriyle doğrulamaya çalışır.
        // Eğer başarılı olursa true, aksi halde false döner.
        if (!Auth::attempt($request->only('sicil', 'password'))) {
            return response()->json([
                'message' => 'Geçersiz kimlik bilgileri (sicil numarası veya şifre yanlış).'
            ], 401);
        }

        $user = $request->user();

        // Kullanıcı için yeni bir Sanctum API token'ı oluştur
        // token adı: 'auth_token' plainTextToken ile token'ın kendisini döndürür.
        $token = $user->createToken('auth_token')->plainTextToken;

        // Başarılı giriş yanıtını döndür
        return response()->json([
            'message' => 'Giriş başarılı.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('mevcutAdliye')
        ], 200);
    }

    /**
     * Kullanıcının oturumunu kapatır ve token'larını siler.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Çıkış başarılı.'
        ]);
    }
}
