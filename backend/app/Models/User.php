<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Str;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'is_verified',
        'bio',
        'verified_at',
        'admin_comment',
        'hourly_rate',
        'certifications',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'verified_at' => 'datetime',
            'certifications' => 'array',
        ];
    }

    protected ?PersonalAccessToken $accessToken = null;

    public function languages()
    {
        return $this->belongsToMany(Language::class, 'formateur_language', 'formateur_id', 'language_id');
    }

    public function formateurProfile()
    {
        return $this->hasOne(FormateurProfile::class);
    }

    public function timeSlots()
    {
        return $this->hasMany(TimeSlot::class, 'formateur_id');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'client_id');
    }

    public function createToken(string $name): object
    {
        $plainTextToken = Str::random(80);

        $token = $this->tokens()->create([
            'name' => $name,
            'token' => hash('sha256', $plainTextToken),
        ]);

        return (object) [
            'accessToken' => $token,
            'plainTextToken' => $plainTextToken,
        ];
    }

    public function tokens()
    {
        return $this->hasMany(PersonalAccessToken::class);
    }

    public function currentAccessToken(): ?PersonalAccessToken
    {
        return $this->accessToken;
    }

    public function withAccessToken(PersonalAccessToken $accessToken): static
    {
        $this->accessToken = $accessToken;

        return $this;
    }
}
