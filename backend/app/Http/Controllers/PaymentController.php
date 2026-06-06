<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    public function createIntent(Request $request)
    {
        $stripeSecret = env('STRIPE_SECRET');

        if (! $stripeSecret || $stripeSecret === 'sk_test_your_key_here') {
            return response()->json([
                'client_secret' => 'mock_secret_'.uniqid(),
                'payment_intent_id' => 'mock_pi_'.uniqid(),
                'mock' => true,
            ]);
        }

        if (class_exists(\Stripe\Stripe::class) && class_exists(\Stripe\PaymentIntent::class)) {
            try {
                \Stripe\Stripe::setApiKey($stripeSecret);

                $intent = \Stripe\PaymentIntent::create([
                    'amount' => 2000,
                    'currency' => 'eur',
                    'metadata' => ['user_id' => auth()->id()],
                ]);

                return response()->json([
                    'client_secret' => $intent->client_secret,
                    'payment_intent_id' => $intent->id,
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Payment initialization failed: '.$e->getMessage(),
                ], 500);
            }
        }

        $response = Http::withToken($stripeSecret)->asForm()->post('https://api.stripe.com/v1/payment_intents', [
            'amount' => 2000,
            'currency' => 'eur',
            'metadata[user_id]' => auth()->id(),
        ]);

        if (! $response->successful()) {
            return response()->json([
                'message' => 'Payment initialization failed: '.($response->json('error.message') ?? 'Stripe request failed.'),
            ], 500);
        }

        $intent = $response->json();

        return response()->json([
            'client_secret' => $intent['client_secret'],
            'payment_intent_id' => $intent['id'],
        ]);
    }
}
