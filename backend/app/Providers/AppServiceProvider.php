<?php

namespace App\Providers;

use App\Models\PersonalAccessToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Auth::viaRequest('sanctum', function (Request $request) {
            $plainToken = $request->bearerToken();

            if (! $plainToken) {
                return null;
            }

            $accessToken = PersonalAccessToken::with('user')
                ->where('token', hash('sha256', $plainToken))
                ->first();

            if (! $accessToken) {
                return null;
            }

            $accessToken->forceFill(['last_used_at' => now()])->save();
            $accessToken->user?->withAccessToken($accessToken);

            return $accessToken->user;
        });
    }
}
