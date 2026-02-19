<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $school = app('current_school');

        return Inertia::render('admin/settings/index', [
            'school' => $school,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $school = app('current_school');

        $validated = $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'email', 'max:255'],
            'address'        => ['nullable', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
        ]);

        $school->update($validated);

        return redirect()
            ->route('admin.settings.index')
            ->with('success', 'School settings updated.');
    }
}