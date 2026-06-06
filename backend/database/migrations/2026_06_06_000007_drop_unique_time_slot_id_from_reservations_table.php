<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        try {
            Schema::table('reservations', function (Blueprint $table) {
                $table->index('time_slot_id', 'reservations_time_slot_id_booking_index');
            });
        } catch (Throwable) {
            // The supporting non-unique index may already exist.
        }

        try {
            Schema::table('reservations', function (Blueprint $table) {
                $table->dropUnique('reservations_time_slot_id_unique');
            });
        } catch (Throwable) {
            // Fresh databases already use the corrected non-unique time_slot_id index.
        }
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->unique('time_slot_id');
        });
    }
};
