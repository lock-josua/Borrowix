<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::whereIn('role', ['staff', 'student'])
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
        $this->authorize(Permission::UserCreate->value);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'role' => ['required', 'in:staff,student'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make(Str::random(32)),
            'email_verified_at' => now(),
        ]);

        Password::sendResetLink(['email' => $validated['email']]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', "{$validated['name']} has been added. A password setup email has been sent.");
    }

    public function show(User $user): Response
    {

        $user->loadCount(['borrowRequests', 'borrowTransactions']);

        return Inertia::render('admin/users/show', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorize(Permission::UserUpdate->value);

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
        $this->authorize(Permission::UserDelete->value);

        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User removed.');
    }
}
