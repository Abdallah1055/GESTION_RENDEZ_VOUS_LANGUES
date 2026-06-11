<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormateurProfile extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'country',
        'phone',
        'hourly_rate',
        'years_experience',
        'profile_picture',
        'certifications',
        'video_link',
        'languages_spoken',
        'languages_taught',
        'completion_token',
        'completed_at',
    ];

    protected $hidden = ['completion_token'];

    protected $casts = [
        'hourly_rate' => 'decimal:2',
        'years_experience' => 'integer',
        'languages_spoken' => 'array',
        'languages_taught' => 'array',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
