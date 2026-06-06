<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\User;

class AdminController extends Controller
{
    public function pendingFormateurs()
    {
        return User::where('role', 'formateur')
            ->where('is_verified', false)
            ->with('languages')
            ->orderBy('created_at')
            ->get();
    }

    public function verifyFormateur(int $id)
    {
        $formateur = User::where('role', 'formateur')->findOrFail($id);
        $formateur->update(['is_verified' => true]);

        return response()->json($formateur->load('languages'));
    }

    public function allUsers()
    {
        return User::with('languages')->orderBy('role')->orderBy('name')->get();
    }

    public function deleteUser(int $id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Impossible de supprimer un admin.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprime.']);
    }

    public function stats()
    {
        return response()->json([
            'clients' => User::where('role', 'client')->count(),
            'formateurs' => User::where('role', 'formateur')->count(),
            'verified' => User::where('role', 'formateur')->where('is_verified', true)->count(),
            'bookings' => Reservation::count(),
        ]);
    }
}
