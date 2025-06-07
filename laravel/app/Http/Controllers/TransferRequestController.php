<?php

namespace App\Http\Controllers;

use App\Models\TransferRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use App\Models\Adliye;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

use Throwable;

class TransferRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $userId = Auth::id(); // Auth helper'ını doğrudan kullanmak daha standarttır

        // 1. İlişkileri Eager Loading ile yükle
        // 'currentAdliye' ve 'user.mevcutAdliye' ilişkilerini tek sorguda çekeriz.
        $requests = TransferRequest::where('user_id', $userId)
                                   ->with(['currentAdliye']) // currentAdliye'yi eager load et
                                   ->latest()
                                   ->get();

        if ($requests->isEmpty()) {
            return response()->json([]);
        }

        // 2. Tüm istenen adliye ID'lerini tek seferde topla
        // flatMap kullanarak zaten Collection üzerinde çalıştığımız için,
        // unique() ve toArray() zaten optimize edilmiş metotlardır.
        $allRequestedAdliyeIds = $requests->flatMap(function ($requestItem) {
            // requestItem->requested_adliye_ids'in null veya boş bir dizi olma ihtimalini kontrol et.
            return $requestItem->requested_adliye_ids ?? [];
        })->unique()->filter()->values()->toArray(); // filter() ile null/boş değerleri at, values() ile indeksleri sıfırla

        $requestedAdliyesMap = [];
        if (!empty($allRequestedAdliyeIds)) {
            // 3. Tüm ilgili Adliye isimlerini tek sorguda çek ve bir Map'e dönüştür
            // Bu, her bir request için ayrı ayrı sorgu yapılmasını engeller.
            $requestedAdliyesMap = Adliye::whereIn('id', $allRequestedAdliyeIds)
                                         ->pluck('adi', 'id')
                                         ->toArray();
        }

        // 4. Koleksiyonu Map ile gezerek "requested_adliye_names" alanını ekle
        $requests = $requests->map(function ($requestItem) use ($requestedAdliyesMap) {
            // requested_adliye_ids'in null olma durumunu kontrol et
            $requestedAdliyeIds = $requestItem->requested_adliye_ids ?? [];

            $requestedAdliyeNames = collect($requestedAdliyeIds)
                                             ->map(fn($id) => $requestedAdliyesMap[$id] ?? null)
                                             ->filter()
                                             ->values() // Anahtarları sıfırla, sadece değerleri al
                                             ->toArray();

            $requestItem->requested_adliye_names = $requestedAdliyeNames;

            return $requestItem;
        });

        // İsteğe bağlı: Eğer response'ta sadece belirli alanları döndürmek istiyorsanız,
        // DTO (Data Transfer Object) veya API Kaynakları (Resources) kullanmak en iyi yoldur.
        // Bu, gereksiz verilerin JSON çıktısına dahil olmasını engeller ve performansı artırabilir.
        // return TransferRequestResource::collection($requests)->response();

        return response()->json($requests);
    }


    /**
     * Store a newly created resource in storage.
     */

    public function store(Request $request)
    {
        try {
            // Kullanıcının mevcut adliyesini çekme işlemi doğrulama öncesine alındı.
            // Bu, 'current_adliye_id' olmadan doğrulama yapmadan önce bir hata döndürebilmemizi sağlar.
            $currentAdliyeId = Auth::user()->mevcut_adliye_id ?? null;

            if (is_null($currentAdliyeId)) {
                return response()->json([
                    'message' => 'Mevcut adliye bilginiz bulunamadı. Lütfen profilinizi kontrol edin veya yöneticinizle iletişime geçin.',
                    'errors' => ['current_adliye_id' => ['Mevcut adliye bilgisi eksik.']]
                ], 400);
            }

            $validatedData = $request->validate([
                'transfer_type' => ['required', 'string', 'in:Aile Birliği,Sağlık,Eğitim,Diğer'],
                'requested_adliye_ids' => ['required', 'array', 'min:1'],
                'requested_adliye_ids.*' => ['integer', 'exists:adliyes,id'],
                'reason' => ['required', 'string', 'max:1000'],
                'documents' => ['nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:2048'],
            ], [
                'transfer_type.required' => 'Tayin talebi türü seçmek zorunludur.',
                'transfer_type.in' => 'Geçersiz bir tayin talebi türü seçildi.',
                'requested_adliye_ids.required' => 'Tayin olmak istediğiniz en az bir adliye seçmek zorunludur.',
                'requested_adliye_ids.array' => 'Tayin adliyeleri bir liste olmalıdır.',
                'requested_adliye_ids.min' => 'En az bir adliye seçmelisiniz.',
                'requested_adliye_ids.*.integer' => 'Adliye ID\'leri sayı olmalıdır.',
                'requested_adliye_ids.*.exists' => 'Seçilen adliyelerden biri bulunamadı.',
                'reason.required' => 'Tayin gerekçesi boş bırakılamaz.',
                'reason.string' => 'Gerekçe geçerli bir metin olmalıdır.',
                'reason.min' => 'Gerekçe en az :min karakter olmalıdır.',
                'reason.max' => 'Gerekçe en fazla :max karakter olabilir.',
                'documents.file' => 'Eklenen belge geçerli bir dosya olmalıdır.',
                'documents.mimes' => 'Desteklenen belge formatları: PDF, DOC, DOCX, JPG, JPEG, PNG.',
                'documents.max' => 'Belge boyutu 2MB\'tan büyük olamaz.',
            ]);

            $documentPath = null;
            if ($request->hasFile('documents')) {
                $documentPath = $request->file('documents')->store('documents', 'public');
            }

            $transferRequest = TransferRequest::create([
                'user_id' => Auth::id(),
                'current_adliye_id' => $currentAdliyeId, // Artık kontrol edildi ve null değil
                'requested_adliye_ids' => $validatedData['requested_adliye_ids'],
                'transfer_type' => $validatedData['transfer_type'],
                'reason' => $validatedData['reason'],
                'document_path' => $documentPath,
                'status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Tayin talebiniz başarıyla oluşturuldu.',
                'request' => $transferRequest
            ], 201);

        } catch (ValidationException $e) {
            // Sadece doğrulama hataları için

            $firstSpecificError = collect($e->errors())->flatten()->first();


            return response()->json([
                'message' => $firstSpecificError,
                'errors' => $e->errors() // Alan bazında hata mesajları
            ], 422);

        } catch (Throwable $e) { // Tüm diğer hataları yakalar
            // Geliştirme ortamında daha fazla bilgi döndürmek isteyebilirsiniz (örn. $e->getMessage(), $e->getFile(), $e->getLine())
            // Üretim ortamında daha genel bir mesaj yeterlidir.
            \Log::error("Tayin talebi oluşturulurken beklenmedik hata: " . $e->getMessage(), ['exception' => $e]);

            return response()->json([
                'message' => 'Tayin talebi oluşturulurken beklenmedik bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
                // 'debug_message' => $e->getMessage() // Sadece geliştirme ortamında kullanın
            ], 500); // Internal Server Error
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(TransferRequest $transferRequest)
    {
        if ($transferRequest->user_id !== auth()->id()) {
            return response()->json(['message' => 'Bu talebi görüntüleme yetkiniz yok.'], 403);
        }

        $transferRequest->load('currentAdliye');

        $requestedAdliyeNames = Adliye::whereIn('id', $transferRequest->requested_adliye_ids)
                                        ->pluck('adi')
                                        ->toArray();
        $transferRequest->requested_adliye_names = $requestedAdliyeNames;


        return response()->json($transferRequest);
    }

    /**
     * Remove the specified resource from storage.
     * Bu metod, bir tayin talebini silmek için kullanılır.
     */
    public function destroy(TransferRequest $transferRequest)
    {
        if ($transferRequest->user_id !== auth()->id()) {
            return response()->json(['message' => 'Bu talebi silme yetkiniz yok.'], 403);
        }

        if ($transferRequest->document_path) {
            Storage::disk('public')->delete($transferRequest->document_path);
        }

        $transferRequest->delete();

        return response()->json(['message' => 'Tayin talebi başarıyla silindi.'], 200);
    }
}
