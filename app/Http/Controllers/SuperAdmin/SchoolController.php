<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class SchoolController extends Controller
{
    public function index(Request $request): Response
    {
        $schools = School::query()
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%"))
            ->when($request->plan, fn ($q) => $q->where('plan', $request->plan))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->withCount(['users', 'equipment'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('super-admin/schools/index', [
            'schools' => $schools,
            'filters' => $request->only(['search', 'plan', 'status']),
        ]);
    }

    public function show(School $school): Response
    {
        $school->load(['subscription', 'users' => fn ($q) => $q->where('role', 'admin')]);
        $school->loadCount(['users', 'equipment', 'borrowRequests', 'borrowTransactions']);

        return Inertia::render('super-admin/schools/show', [
            'school' => $school,
        ]);
    }

    public function suspend(Request $request, School $school): RedirectResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $school->update([
            'status'             => 'suspended',
            'suspension_reason'  => $request->reason,
        ]);

        // Lock out all school users by invalidating their sessions
        $school->users()->each(fn ($user) => $user->tokens()->delete());

        return redirect()
            ->route('super-admin.schools.show', $school)
            ->with('success', "{$school->name} has been suspended.");
    }

    public function reactivate(School $school): RedirectResponse
    {
        $school->update([
            'status'            => 'active',
            'suspension_reason' => null,
        ]);

        return redirect()
            ->route('super-admin.schools.show', $school)
            ->with('success', "{$school->name} has been reactivated.");
    }

    public function impersonate(School $school): RedirectResponse
    {
        // Get the school's admin account
        $admin = $school->users()->where('role', 'admin')->firstOrFail();

        // Store the super admin's original ID so we can restore later
        session(['impersonating_from' => Auth::id()]);

        Auth::login($admin);

        return redirect()->route('admin.dashboard')
            ->with('success', "Now impersonating {$school->name}.");
    }
}