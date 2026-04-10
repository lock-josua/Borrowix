<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('transactions:mark-overdue')->twiceDaily(8, 20);

Schedule::command('transactions:send-reminders')->hourly();

Schedule::command('activity-logs:cleanup')->dailyAt('2:00');
