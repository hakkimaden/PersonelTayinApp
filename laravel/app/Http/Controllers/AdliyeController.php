<?php

namespace App\Http\Controllers;

use App\Models\Adliye;
use Illuminate\Http\Request;

class AdliyeController extends Controller
{
    /**
     * Tüm adliyeleri listeler.
     * Bu API endpoint'i kimlik doğrulaması gerektirmeyebilir
     * çünkü herkesin adliye bilgilerini görmesi beklenebilir.
     */
    public function index()
    {
        // Tüm adliyeleri il adına göre gruplandırarak veya düz liste olarak döndürebilirsiniz.
        // Şimdilik düz liste olarak döndürelim.
        $adliyeler = Adliye::orderBy('adi')->get();
        return response()->json($adliyeler);
    }

    /**
     * Belirli bir adliyenin detaylarını gösterir.
     */
    public function show(Adliye $adliye)
    {
        return response()->json($adliye);
    }

    // Yöneticilerin adliye eklemesi/güncellemesi için store/update metodları da eklenebilir.
    // public function store(Request $request) { ... }
    // public function update(Request $request, Adliye $adliye) { ... }
}
