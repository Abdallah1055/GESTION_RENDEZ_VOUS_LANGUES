<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TimeSlot extends Model
{
    protected $fillable = [
        'formateur_id',
        'date',
        'heure_debut',
        'heure_fin',
        'est_reserve',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'est_reserve' => 'boolean',
    ];

    public function formateur()
    {
        return $this->belongsTo(User::class, 'formateur_id');
    }

    public function reservation()
    {
        return $this->hasOne(Reservation::class);
    }
}
