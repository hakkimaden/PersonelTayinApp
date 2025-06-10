<?php

namespace App\Http\Controllers;

use App\Models\Adliye;
use Illuminate\Http\Request;

class AdliyeController extends Controller
{
    /**
     * Tüm adliyeleri listeler.
     * Bu API endpoint'i kimlik doğrulaması gerektirmez.
     * çünkü herkesin adliye bilgilerini görmesi beklenebilir.
     */
    public function index()
    {
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

}
