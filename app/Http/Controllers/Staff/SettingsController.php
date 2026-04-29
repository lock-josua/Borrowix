<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Services\UpdateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function __construct(protected UpdateService $updateService) {}

    public function index(): RedirectResponse
    {
        return redirect()->route('staff.settings.profile');
    }

    public function profile(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('staff/settings/profile', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$request->user()->id],
        ]);

        $user = $request->user();
        $user->fill($validated);
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        $user->save();

        return redirect()->route('staff.settings.profile')
            ->with('success', 'Profile updated.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('staff.settings.profile')
            ->with('success', 'Password changed successfully.');
    }

    public function updates(): Response
    {
        return Inertia::render('staff/settings/updates', [
            'updateStatus' => $this->updateService->status(),
        ]);
    }

    public function checkUpdates(): \Illuminate\Http\JsonResponse
    {
        return response()->json(
            $this->updateService->forceRefresh()
        );
    }
}
