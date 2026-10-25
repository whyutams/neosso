<?php

namespace Database\Seeders;

use App\Models\AuthLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AuthLogSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) {
            return;
        }

        // Jangan gandakan jika sudah ada banyak log
        if (AuthLog::count() > 50) {
            return;
        }

        $now = Carbon::now();
        $records = [];

        // Buat data login 30 hari ke belakang
        for ($i = 29; $i >= 0; $i--) {
            $day = $now->copy()->subDays($i);
            // Pola variasi harian realistis (hari kerja lebih tinggi dari weekend)
            $isWeekend = in_array($day->dayOfWeek, [Carbon::SATURDAY, Carbon::SUNDAY]);
            $dailyCount = $isWeekend ? rand(15, 35) : rand(40, 95);

            for ($j = 0; $j < $dailyCount; $j++) {
                $user = $users->random();
                $records[] = [
                    'user_id' => $user->id,
                    'event' => 'login',
                    'email' => $user->email,
                    'ip_address' => '127.0.0.1',
                    'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'status' => 'success',
                    'message' => 'Login berhasil via kredensial',
                    'created_at' => $day->copy()->setTime(rand(6, 22), rand(0, 59), rand(0, 59)),
                ];
            }
        }

        foreach (array_chunk($records, 100) as $chunk) {
            AuthLog::insert($chunk);
        }
    }
}
