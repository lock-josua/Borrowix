<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RegisterSuccessController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $school = $request->session()->get('registered_school');

        // Guard: if someone hits this URL directly with no session data,
        // send them to the register page instead of showing a blank page.
        if (! $school) {
            return redirect()->route('register');
        }

        // Pull the data once — don't leave it in the session so refreshing
        // the page gracefully redirects rather than showing stale data.
        $request->session()->forget('registered_school');

        return Inertia::render('auth/register-success', [
            'schoolName' => $school['school_name'],
            'tenantUrl' => $school['subdomain_url'],
            'loginUrl' => $school['login_url'],
            'adminEmail' => $school['admin_email'],
        ]);
    }
}
