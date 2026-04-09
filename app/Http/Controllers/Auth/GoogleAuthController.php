<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
<<<<<<< HEAD
use Illuminate\Http\Request;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
=======
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
>>>>>>> 65b9d549be5954929b98db672d6bddd487df64ee

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
<<<<<<< HEAD
        $googleUser = Socialite::driver('google')->user();

        $user = User::updateOrCreate(
            ['google_id' => $googleUser->getId()],
            [
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'password' => bcrypt(Str::random(16)),
            ]
        );

        Auth::login($user);

        // Redirect back to React app
        return redirect()->route('dashboard');
=======
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect('/login')->withErrors(['google' => 'Google authentication failed. Please try again.']);
        }

        // SECURITY: Only allow Google login for accounts that already exist in
        // the central users table. Never create a new user from OAuth — doing so
        // would insert a row with role = 'super_admin' (the column default),
        // giving any Google account super admin access.
        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if (! $user) {
            return redirect('/login')->withErrors([
                'google' => 'No account found for this Google identity. Contact the platform administrator.',
            ]);
        }

        // Sync the Google ID on first OAuth login for an existing user.
        $user->updateQuietly([
            'google_id' => $user->google_id ?? $googleUser->getId(),
            'name' => $googleUser->getName(),
        ]);

        Auth::login($user);

        return redirect('/dashboard');
>>>>>>> 65b9d549be5954929b98db672d6bddd487df64ee
    }
}
