<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\TimeSlot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ReservationController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'time_slot_id' => ['required', 'exists:time_slots,id'],
            'payment_intent_id' => ['required', 'string', 'max:255'],
        ]);

        $payment = $this->verifyPaymentIntent($data['payment_intent_id']);

        if (! $payment['ok']) {
            return response()->json(['message' => $payment['message']], 422);
        }

        $reservation = DB::transaction(function () use ($request, $data) {
            $slot = TimeSlot::whereKey($data['time_slot_id'])->lockForUpdate()->firstOrFail();

            $hasActiveReservation = Reservation::where('time_slot_id', $slot->id)
                ->where('statut', 'confirmee')
                ->lockForUpdate()
                ->exists();

            if ($hasActiveReservation) {
                abort(422, 'Ce creneau est deja reserve.');
            }

            $reservation = Reservation::create([
                'client_id' => $request->user()->id,
                'time_slot_id' => $slot->id,
                'statut' => 'confirmee',
                'payment_intent_id' => $data['payment_intent_id'],
                'montant' => 2000,
            ]);

            $slot->update(['est_reserve' => true]);

            return $reservation->load('timeSlot.formateur.languages');
        });

        return response()->json($reservation, 201);
    }

    public function cancel(Request $request, Reservation $reservation)
    {
        if ($reservation->client_id !== $request->user()->id) {
            return response()->json(['message' => 'Reservation non autorisee.'], 403);
        }

        $reservation = DB::transaction(function () use ($reservation) {
            $reservation = Reservation::whereKey($reservation->id)->lockForUpdate()->firstOrFail();
            $slot = TimeSlot::whereKey($reservation->time_slot_id)->lockForUpdate()->firstOrFail();

            if ($reservation->statut !== 'annulee') {
                $reservation->update(['statut' => 'annulee']);
            }

            $hasActiveReservation = Reservation::where('time_slot_id', $slot->id)
                ->where('statut', 'confirmee')
                ->exists();

            $slot->update(['est_reserve' => $hasActiveReservation]);

            return $reservation->fresh()->load('timeSlot.formateur.languages');
        });

        return response()->json($reservation);
    }

    public function myReservations(Request $request)
    {
        return Reservation::where('client_id', $request->user()->id)
            ->with(['timeSlot.formateur.languages', 'timeSlot.formateur'])
            ->latest()
            ->get()
            ->map(function ($reservation) {
                return [
                    'reservation_id' => $reservation->id,
                    'meeting_url' => $reservation->meeting_url,
                    'slot' => [
                        'date' => $reservation->timeSlot->date,
                        'start_time' => $reservation->timeSlot->heure_debut,
                        'end_time' => $reservation->timeSlot->heure_fin,
                    ],
                    'formateur' => [
                        'name' => $reservation->timeSlot->formateur->name,
                        'hourly_rate' => $reservation->timeSlot->formateur->hourly_rate ?? 0,
                    ],
                    'languages' => $reservation->timeSlot->formateur->languages,
                    'statut' => $reservation->statut,
                ];
            });
    }

    private function verifyPaymentIntent(string $paymentIntentId): array
    {
        $secret = config('services.stripe.secret');

        if (! $secret || $secret === 'sk_test_your_key_here') {
            return str_starts_with($paymentIntentId, 'pi_')
                || str_starts_with($paymentIntentId, 'test_')
                || str_starts_with($paymentIntentId, 'mock_pi_')
                ? ['ok' => true, 'message' => 'Paiement local accepte.']
                : ['ok' => false, 'message' => 'Configuration Stripe manquante.'];
        }

        $response = Http::withToken($secret)->get("https://api.stripe.com/v1/payment_intents/{$paymentIntentId}");

        if (! $response->successful()) {
            return ['ok' => false, 'message' => 'Paiement Stripe introuvable.'];
        }

        $intent = $response->json();
        $valid = ($intent['status'] ?? null) === 'succeeded' && (int) ($intent['amount'] ?? 0) === 2000;

        return $valid
            ? ['ok' => true, 'message' => 'Paiement confirme.']
            : ['ok' => false, 'message' => 'Paiement Stripe non confirme.'];
    }
}
