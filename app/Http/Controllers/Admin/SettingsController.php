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
        $tenant = tenant();

        return Inertia::render('admin/settings/index', [
            'school' => [
                'name' => $tenant->school_name ?? '',
                'email' => $tenant->school_email,
                'contact_number' => $tenant->contact_number ?? '',
                'address' => $tenant->address ?? '',
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        // tenant()->update() saves to the tenants table in the central DB.
        // contact_number has its own dedicated column so it is saved directly.
        // Attributes without dedicated columns (address, school_name) go into
        // the data JSON column automatically.
        tenant()->update([
            'school_name' => $validated['name'],
            'school_email' => $validated['email'],
            'contact_number' => $validated['contact_number'],
            'address' => $validated['address'],
        ]);

        return redirect()
            ->route('admin.settings.index')
            ->with('success', 'School settings updated.');
    }
}
