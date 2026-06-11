<?php

namespace App\Http\Controllers;

use App\Models\Language;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\Request;

class FormateurController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->where('role', 'formateur')
            ->where('is_verified', true)
            ->with('languages');

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhereHas('languages', fn ($language) => $language->where('nom', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('language_id')) {
            $query->whereHas('languages', fn ($language) => $language->whereKey($request->integer('language_id')));
        }

        return $query->orderBy('name')->get();
    }

    public function show(int $id)
    {
        $formateur = User::where('role', 'formateur')
            ->where('is_verified', true)
            ->with(['languages', 'timeSlots' => fn ($query) => $query->where('est_reserve', false)->orderBy('date')->orderBy('heure_debut')])
            ->findOrFail($id);

        return response()->json($formateur);
    }

    public function myStudents(Request $request)
    {
        $students = User::whereHas('reservations.timeSlot', function ($query) use ($request) {
            $query->where('formateur_id', $request->user()->id);
        })
            ->with(['reservations' => fn ($query) => $query
                ->whereHas('timeSlot', fn ($slot) => $slot->where('formateur_id', $request->user()->id))
                ->where('statut', 'confirmee')
                ->with('timeSlot')
            ])
            ->orderBy('name')
            ->get();

        return response()->json($students);
    }

    public function updateProfile(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
        ]);

        $request->user()->update($data);

        return response()->json($request->user()->fresh()->load('languages'));
    }

    public function addLanguage(Request $request)
    {
        $data = $request->validate([
            'language_id' => ['required', 'exists:languages,id'],
        ]);

        $request->user()->languages()->syncWithoutDetaching([$data['language_id']]);

        return response()->json($request->user()->fresh()->load('languages'));
    }

    public function removeLanguage(Request $request, int $language_id)
    {
        Language::findOrFail($language_id);
        $request->user()->languages()->detach($language_id);

        return response()->json($request->user()->fresh()->load('languages'));
    }

    public function getReservationDetails(Request $request, $id)
    {
        $reservation = Reservation::where('id', $id)
            ->whereHas('timeSlot', function ($query) use ($request) {
                $query->where('formateur_id', $request->user()->id);
            })
            ->with(['client', 'timeSlot', 'timeSlot.formateur'])
            ->firstOrFail();

        $startTime = strtotime($reservation->timeSlot->heure_debut);
        $endTime = strtotime($reservation->timeSlot->heure_fin);
        $duration = ($endTime - $startTime) / 3600; // Convert to hours

        $hourlyRate = $reservation->timeSlot->formateur->hourly_rate ?? 0;
        $totalPrice = $hourlyRate * $duration;

        return response()->json([
            'student' => [
                'name' => $reservation->client->name,
                'email' => $reservation->client->email,
            ],
            'reservation' => [
                'date' => $reservation->timeSlot->date,
                'start_time' => $reservation->timeSlot->heure_debut,
                'end_time' => $reservation->timeSlot->heure_fin,
            ],
            'pricing' => [
                'hourly_rate' => $hourlyRate,
                'duration' => $duration,
                'total_price' => $totalPrice,
            ],
            'meeting_url' => $reservation->meeting_url,
        ]);
    }

    public function updateMeetingUrl(Request $request, $id)
    {
        $data = $request->validate([
            'meeting_url' => ['nullable', 'string', 'max:500'],
        ]);

        $reservation = Reservation::where('id', $id)
            ->whereHas('timeSlot', function ($query) use ($request) {
                $query->where('formateur_id', $request->user()->id);
            })
            ->firstOrFail();

        $reservation->meeting_url = $data['meeting_url'];
        $reservation->save();

        return response()->json([
            'meeting_url' => $reservation->meeting_url,
        ]);
    }

    public function cancelReservation(Request $request, $id)
    {
        $reservation = Reservation::where('id', $id)
            ->whereHas('timeSlot', function ($query) use ($request) {
                $query->where('formateur_id', $request->user()->id);
            })
            ->firstOrFail();

        if ($reservation->statut === 'annulee') {
            return response()->json(['message' => 'Reservation already cancelled']);
        }

        $reservation->statut = 'annulee';
        $reservation->save();

        $reservation->timeSlot->est_reserve = false;
        $reservation->timeSlot->save();

        return response()->json(['message' => 'Reservation cancelled successfully']);
    }
}
