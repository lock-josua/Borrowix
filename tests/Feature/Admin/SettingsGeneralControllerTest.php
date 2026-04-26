<?php

use App\Http\Controllers\Admin\SettingsController;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

test('update general validates default borrow days minimum', function () {
    $controller = app(SettingsController::class);

    $request = Request::create('/admin/settings/general', 'PATCH', [
        'name' => 'Test School',
        'email' => 'school@example.com',
        'contact_number' => '1234567890',
        'address' => 'Sample Address',
        'academic_year' => '2025-2026',
        'default_borrow_days' => 0,
        'timezone' => 'Asia/Manila',
    ]);

    expect(fn () => $controller->updateGeneral($request))
        ->toThrow(ValidationException::class);
});

test('update general validates default borrow days maximum', function () {
    $controller = app(SettingsController::class);

    $request = Request::create('/admin/settings/general', 'PATCH', [
        'name' => 'Test School',
        'email' => 'school@example.com',
        'contact_number' => '1234567890',
        'address' => 'Sample Address',
        'academic_year' => '2025-2026',
        'default_borrow_days' => 366,
        'timezone' => 'Asia/Manila',
    ]);

    expect(fn () => $controller->updateGeneral($request))
        ->toThrow(ValidationException::class);
});
