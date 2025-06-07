<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdliyeController;
use App\Http\Controllers\TransferRequestController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you may register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public rotalar (kimlik doğrulama gerektirmez)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Adliye Bilgileri (Public olabilir)
Route::get('/adliyeler', [AdliyeController::class, 'index']);
Route::get('/adliyeler/{adliye}', [AdliyeController::class, 'show']);


// Kimlik doğrulaması gerektiren rotalar
Route::middleware('auth:sanctum')->group(function () {

    // Tayin Talebi Rotaları
    Route::post('/transfer-requests', [TransferRequestController::class, 'store']); // Talep oluşturma
    Route::get('/transfer-requests', [TransferRequestController::class, 'index']); // Talepleri listeleme (kullanıcının kendi)
    Route::get('/transfer-requests/{transferRequest}', [TransferRequestController::class, 'show']); // Tek bir talebi görüntüleme
    // YENİ EKLENEN ROTA: Tayin talebi silme
    Route::delete('/transfer-requests/{transferRequest}', [TransferRequestController::class, 'destroy']);


    Route::get('/admin/users', [AdminController::class, 'getUsers']);
    Route::get('/admin/requests', [AdminController::class, 'getRequests']);
    Route::put('/admin/requests/{id}/status', [AdminController::class, 'updateRequestStatus']); // New route for status update

    // Mevcut kullanıcı bilgilerini döndürür
    Route::get('/user', function (Request $request) {
        return $request->user();
        //return \App\Models\User::with('mevcutAdliye')->find($request->user()->id);
    });

    Route::post('/logout', [AuthController::class, 'logout']);







});
