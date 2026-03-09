<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $school = app('current_school');

        $users = User::where('school_id', $school->id)
            ->whereIn('role', ['staff', 'student'])
            ->when($request->search, fn ($q) => $q->where(function ($query) use ($request) {
                $query->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->when($request->role, fn ($q) => $q->where('role', $request->role))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function invite(): Response
    {
        return Inertia::render('admin/users/invite');
    }

    public function store(Request $request): RedirectResponse
    {
        $school = app('current_school');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'role' => ['required', 'in:staff,student'],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'school_id' => $school->id,
            'password' => Hash::make('password123'), // temporary password
            'email_verified_at' => now(),
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', "{$validated['name']} has been added.");
    }

    public function show(User $user): Response
    {
        $this->authorizeSchool($user);

        $user->loadCount(['borrowRequests', 'borrowTransactions']);

        return Inertia::render('admin/users/show', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorizeSchool($user);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'in:staff,student'],
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
        ]);

        $user->update($validated);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorizeSchool($user);

        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User removed.');
    }

    // Prevent admins from managing users that belong to other schools
    private function authorizeSchool(User $user): void
    {
        $school = app('current_school');

        abort_if($user->school_id !== $school->id, 403, 'Unauthorized.');
    }
}
