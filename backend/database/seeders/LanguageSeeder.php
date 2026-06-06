<?php

namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Seeder;

class LanguageSeeder extends Seeder
{
    public function run(): void
    {
        collect(['English', 'Spanish', 'French', 'German', 'Italian', 'Arabic', 'Chinese', 'Japanese'])
            ->each(fn (string $nom) => Language::firstOrCreate(['nom' => $nom]));
    }
}
