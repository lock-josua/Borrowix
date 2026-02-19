<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

        public function callback() {
            // Handle the callback from Google
            try {
                $googleUser = Socialite::driver('google')->user();
            } catch (\Exception $e) {
                return redirect('/login')->withErrors(['google' => 'Authentication failed.']);
            }

            $user = User::where('google_id', $googleUser->getId())
                        ->orWhere('email', $googleUser->getEmail())
                        ->first();

            if ($user) {
                $user->update([
                    'name'      => $googleUser->getName(),
                    'google_id' => $user->google_id ?? $googleUser->getId(),
                ]);
            } else {
                $user = User::create([
                    'google_id'         => $googleUser->getId(),
                    'name'              => $googleUser->getName(),
                    'email'             => $googleUser->getEmail(),
                    'password'          => bcrypt(Str::random(16)),
                    'email_verified_at' => now(),
                ]);
            }

            Auth::login($user);

            return redirect(config('app.frontend_url') . '/dashboard');
        }
}
