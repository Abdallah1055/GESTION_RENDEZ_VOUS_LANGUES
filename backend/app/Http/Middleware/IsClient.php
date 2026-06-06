<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsClient
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role !== 'client') {
            return response()->json(['message' => 'Acces client requis.'], 403);
        }

        return $next($request);
    }
}
