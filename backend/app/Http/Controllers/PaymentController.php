<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    public function createIntent()
    {
        $secret = config('services.stripe.secret');

        if (! $secret) {
            return response()->json([
                'client_secret' => null,
                'payment_intent_id' => 'test_'.bin2hex(random_bytes(12)),
            ]);
        }

        $response = Http::withToken($secret)->asForm()->post('https://api.stripe.com/v1/payment_intents', [
            'amount' => 2000,
            'currency' => 'eur',
            'automatic_payment_methods[enabled]' => 'true',
        ]);

        if (! $response->successful()) {
            return response()->json(['message' => 'Impossible de creer le paiement Stripe.'], 422);
        }

        $intent = $response->json();

        return response()->json([
            'client_secret' => $intent['client_secret'],
            'payment_intent_id' => $intent['id'],
        ]);
    }
}
