<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
        'client_id',
        'time_slot_id',
        'statut',
        'payment_intent_id',
        'montant',
        'meeting_url',
    ];

    protected $casts = [
        'montant' => 'integer',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function timeSlot()
    {
        return $this->belongsTo(TimeSlot::class);
    }
}
