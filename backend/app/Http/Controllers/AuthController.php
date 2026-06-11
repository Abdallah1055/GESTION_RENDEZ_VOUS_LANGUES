<?php

namespace App\Http\Controllers;

use App\Models\Language;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', Rule::in(['client', 'formateur'])],
            'languages' => ['required_if:role,formateur', 'array'],
            'languages.*' => ['required_if:role,formateur', 'integer', 'exists:languages,id'],
            'hourly_rate' => ['required_if:role,formateur', 'numeric', 'min:0'],
            'certifications' => ['nullable', 'array'],
            'certifications.*' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ]);

        $certificationData = [];
        if ($request->hasFile('certifications') && $data['role'] === 'formateur') {
            foreach ($request->file('certifications') as $certification) {
                $path = $certification->store('certifications', 'public');
                $certificationData[] = [
                    'original_name' => $certification->getClientOriginalName(),
                    'file_path' => $path,
                ];
            }
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $data['role'],
            'status' => $data['role'] === 'formateur' ? 'pending' : 'active',
            'is_verified' => $data['role'] === 'client',
            'hourly_rate' => $data['role'] === 'formateur' ? $data['hourly_rate'] : null,
            'certifications' => !empty($certificationData) ? $certificationData : null,
        ]);

        if ($data['role'] === 'formateur' && !empty($data['languages'])) {
            $user->languages()->sync($data['languages']);
        }

        return response()->json([
            'message' => $user->role === 'formateur'
                ? 'Compte cree. Votre profil formateur attend la validation admin.'
                : 'Compte cree avec succes.',
            'user' => $user->load('languages'),
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Identifiants invalides.'], 422);
        }

        if ($user->role === 'formateur' && $user->status !== 'accepted') {
            return response()->json(['message' => 'Votre compte formateur est en attente de verification.'], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user->load('languages'),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Deconnexion reussie.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('languages'));
    }
}
