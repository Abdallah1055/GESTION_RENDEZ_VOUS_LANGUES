<?php

namespace App\Http\Controllers;

use App\Models\Language;
use Illuminate\Http\Request;

class LanguageController extends Controller
{
    public function index()
    {
        return Language::orderBy('nom')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:100', 'unique:languages,nom'],
        ]);

        return response()->json(Language::create($data), 201);
    }

    public function destroy(Language $langue)
    {
        $langue->delete();

        return response()->json(['message' => 'Langue supprimee.']);
    }
}
