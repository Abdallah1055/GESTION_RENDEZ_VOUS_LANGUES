<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminFormateurController extends Controller
{
    public function index()
    {
        $pendingFormateurs = User::where('role', 'formateur')
            ->where('status', 'pending')
            ->with('languages')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($pendingFormateurs);
    }

    public function show($id)
    {
        $formateur = User::where('role', 'formateur')
            ->where('id', $id)
            ->with('languages')
            ->firstOrFail();

        return response()->json($formateur);
    }

    public function accept(Request $request, $id)
    {
        $formateur = User::where('role', 'formateur')
            ->where('id', $id)
            ->firstOrFail();

        $formateur->update([
            'status' => 'accepted',
            'verified_at' => now(),
            'is_verified' => true,
        ]);

        return response()->json([
            'message' => 'Formateur accepte avec succes.',
            'formateur' => $formateur->load('languages'),
        ]);
    }

    public function refuse(Request $request, $id)
    {
        $data = $request->validate([
            'admin_comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $formateur = User::where('role', 'formateur')
            ->where('id', $id)
            ->firstOrFail();

        $formateur->update([
            'status' => 'refused',
            'admin_comment' => $data['admin_comment'] ?? null,
        ]);

        return response()->json([
            'message' => 'Formateur refuse.',
            'formateur' => $formateur->load('languages'),
        ]);
    }

    public function allFormateurs()
    {
        $formateurs = User::where('role', 'formateur')
            ->with('languages')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($formateurs);
    }

    public function downloadCertification($id, $filename)
    {
        $formateur = User::where('role', 'formateur')
            ->where('id', $id)
            ->firstOrFail();

        $certifications = $formateur->certifications;
        
        if (!$certifications) {
            return response()->json(['message' => 'No certifications found'], 404);
        }

        $certArray = is_array($certifications) ? $certifications : json_decode($certifications, true);
        
        if (!$certArray) {
            return response()->json(['message' => 'Invalid certifications data'], 400);
        }

        $certification = collect($certArray)->firstWhere('original_name', $filename);

        if (!$certification) {
            return response()->json(['message' => 'Certification not found'], 404);
        }

        $filePath = $certification['file_path'] ?? null;

        if (!$filePath) {
            return response()->json(['message' => 'File path not found'], 404);
        }

        if (!Storage::disk('public')->exists($filePath)) {
            return response()->json(['message' => 'File not found on server'], 404);
        }

        return Storage::disk('public')->download($filePath, $filename);
    }
}
