<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FormateurController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\TimeSlotController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/formateurs', [FormateurController::class, 'index']);
Route::get('/formateurs/{id}', [FormateurController::class, 'show']);
Route::get('/langues', [LanguageController::class, 'index']);
Route::get('/time-slots/{formateur_id}', [TimeSlotController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::middleware('client')->group(function () {
        Route::post('/payment-intent', [PaymentController::class, 'createIntent']);
        Route::post('/reservations', [ReservationController::class, 'store']);
        Route::delete('/reservations/{reservation}', [ReservationController::class, 'cancel']);
        Route::get('/my-reservations', [ReservationController::class, 'myReservations']);
    });

    Route::middleware('formateur')->group(function () {
        Route::post('/time-slots', [TimeSlotController::class, 'store']);
        Route::delete('/time-slots/{timeSlot}', [TimeSlotController::class, 'destroy']);
        Route::get('/my-students', [FormateurController::class, 'myStudents']);
        Route::put('/profile', [FormateurController::class, 'updateProfile']);
        Route::post('/add-language', [FormateurController::class, 'addLanguage']);
        Route::delete('/remove-language/{language_id}', [FormateurController::class, 'removeLanguage']);
    });

    Route::middleware('admin')->group(function () {
        Route::get('/admin/pending-formateurs', [AdminController::class, 'pendingFormateurs']);
        Route::put('/admin/verify-formateur/{id}', [AdminController::class, 'verifyFormateur']);
        Route::get('/admin/users', [AdminController::class, 'allUsers']);
        Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/admin/stats', [AdminController::class, 'stats']);
        Route::post('/admin/langues', [LanguageController::class, 'store']);
        Route::delete('/admin/langues/{langue}', [LanguageController::class, 'destroy']);
    });
});
