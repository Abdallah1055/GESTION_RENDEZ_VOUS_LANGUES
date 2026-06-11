<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsFormateur
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role !== 'formateur') {
            return response()->json(['message' => 'Acces formateur requis.'], 403);
        }

        if ($request->user()->status !== 'accepted') {
            return response()->json(['message' => 'Votre compte formateur est en attente de verification.'], 403);
        }

        return $next($request);
    }
}
