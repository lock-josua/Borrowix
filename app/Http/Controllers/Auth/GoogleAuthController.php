<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect('/login')->withErrors(['google' => 'Google authentication failed. Please try again.']);
        }

        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if (! $user) {
            return redirect('/login')->withErrors([
                'google' => 'No account found for this Google identity. Contact the platform administrator.',
            ]);
        }

        $user->updateQuietly([
            'google_id' => $user->google_id ?? $googleUser->getId(),
            'name' => $googleUser->getName(),
        ]);

        Auth::login($user);

        return redirect('/dashboard');
    }
}
