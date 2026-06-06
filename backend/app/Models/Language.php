<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Language extends Model
{
    protected $fillable = ['nom'];

    public function formateurs()
    {
        return $this->belongsToMany(User::class, 'formateur_language', 'language_id', 'formateur_id');
    }
}
