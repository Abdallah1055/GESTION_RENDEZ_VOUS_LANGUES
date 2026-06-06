<?php

namespace App\Http\Controllers;

use App\Models\TimeSlot;
use Illuminate\Http\Request;

class TimeSlotController extends Controller
{
    public function index(int $formateur_id)
    {
        return TimeSlot::where('formateur_id', $formateur_id)
            ->where('est_reserve', false)
            ->whereDate('date', '>=', now()->toDateString())
            ->orderBy('date')
            ->orderBy('heure_debut')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
            'heure_debut' => ['required', 'date_format:H:i'],
            'heure_fin' => ['required', 'date_format:H:i', 'after:heure_debut'],
        ]);

        $slot = TimeSlot::create([
            ...$data,
            'formateur_id' => $request->user()->id,
            'est_reserve' => false,
        ]);

        return response()->json($slot, 201);
    }

    public function destroy(Request $request, TimeSlot $timeSlot)
    {
        if ($timeSlot->formateur_id !== $request->user()->id) {
            return response()->json(['message' => 'Creneau non autorise.'], 403);
        }

        if ($timeSlot->est_reserve) {
            return response()->json(['message' => 'Impossible de supprimer un creneau deja reserve.'], 422);
        }

        $timeSlot->delete();

        return response()->json(['message' => 'Creneau supprime.']);
    }
}
