<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Mail\SchoolCreatedMail;
use App\Mail\SchoolProfileUpdatedMail;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use App\Services\SystemLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SchoolController extends Controller
{
    public function index(Request $request): Response
    {
        $schools = Tenant::with('domains')
            ->when($request->search, fn ($q) => $q->where('school_email', 'like', "%{$request->search}%")
                ->orWhere('data->school_name', 'like', "%{$request->search}%")
            )
            ->when($request->plan, fn ($q) => $q->where('data->plan', $request->plan))
            ->when($request->status, fn ($q) => $q->where('data->status', $request->status))
            ->latest()
            ->paginate(15)
            ->through(fn ($t) => [
                'id' => $t->id,
                'name' => $t->school_name ?? $t->id,
                'email' => $t->school_email,
                'contact_number' => $t->contact_number ?? '',
                'plan' => $t->plan ?? 'free',
                'status' => $t->status ?? 'active',
                'subdomain' => $t->domains->first()?->domain,
                'school_url' => $t->domains->first()?->domain
                    ? 'http://'.$t->domains->first()?->domain.'.'.config('tenancy.central_domains')[0].':8000'
                    : null,
                'created_at' => $t->created_at,
            ]);

        return Inertia::render('super-admin/schools/index', [
            'schools' => $schools,
            'filters' => $request->only(['search', 'plan', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('super-admin/schools/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'school_name' => ['required', 'string', 'max:255'],
            'admin_name' => ['required', 'string', 'max:255'],
            'admin_email' => ['required', 'email', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
        ]);

        $slug = Str::slug($validated['school_name']);

        if (Tenant::where('id', $slug)->exists()) {
            return back()->withErrors([
                'school_name' => 'A school with this name already exists. Try a slightly different name.',
            ]);
        }

        $tenant = Tenant::create([
            'id' => $slug,
            'school_email' => $validated['admin_email'],
            'admin_email' => $validated['admin_email'],
            'contact_number' => $validated['contact_number'] ?? null,
            'school_name' => $validated['school_name'],
            'plan' => 'free',
            'status' => 'active',
        ]);

        $tenant->domains()->create(['domain' => $slug]);

        $result = $tenant->run(function () use ($validated) {
            $user = User::create([
                'name' => $validated['admin_name'],
                'email' => $validated['admin_email'],
                'role' => 'admin',
                'password' => Hash::make(Str::random(32)),
                'email_verified_at' => now(),
            ]);

            $token = Str::random(64);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['email' => $user->email, 'token' => Hash::make($token), 'created_at' => now()]
            );

            return ['token' => $token, 'email' => $user->email];
        });

        $centralDomain = config('tenancy.central_domains')[0];
        $subdomainUrl = "http://{$slug}.{$centralDomain}:8000";
        $loginUrl = "{$subdomainUrl}/login";
        $resetLink = "{$subdomainUrl}/reset-password/{$result['token']}?email=".urlencode($result['email']);

        Mail::to($validated['admin_email'])->send(new SchoolCreatedMail(
            schoolName: $validated['school_name'],
            adminEmail: $validated['admin_email'],
            subdomainUrl: $subdomainUrl,
            loginUrl: $loginUrl,
            resetLink: $resetLink,
        ));

        SystemLogService::log(
            'school_created',
            "New school created: {$validated['school_name']}",
            $tenant->id,
            'super_admin'
        );

        return redirect()
            ->route('super-admin.schools.index')
            ->with('success', 'School created successfully. Login credentials sent to '.$validated['admin_email'].'.')
            ->with('credentials', [
                'admin_email' => $validated['admin_email'],
                'subdomain_url' => $subdomainUrl,
                'login_url' => $loginUrl,
                'reset_link' => $resetLink,
            ]);
    }

    public function resendCredentials(Tenant $tenant): RedirectResponse
    {
        $tenant->load('domains');

        $result = $tenant->run(function () {
            $user = User::where('role', 'admin')->first();

            DB::table('password_reset_tokens')->where('email', $user->email)->delete();

            $token = Str::random(64);

            DB::table('password_reset_tokens')->insert([
                'email' => $user->email,
                'token' => Hash::make($token),
                'created_at' => now(),
            ]);

            return ['token' => $token, 'email' => $user->email];
        });

        $subdomain = $tenant->domains->first()?->domain;
        $centralDomain = config('tenancy.central_domains')[0];
        $subdomainUrl = "http://{$subdomain}.{$centralDomain}:8000";
        $loginUrl = "{$subdomainUrl}/login";
        $resetLink = "{$subdomainUrl}/reset-password/{$result['token']}?email=".urlencode($result['email']);

        Mail::to($tenant->school_email)->send(new SchoolCreatedMail(
            schoolName: $tenant->school_name ?? $tenant->id,
            adminEmail: $result['email'],
            subdomainUrl: $subdomainUrl,
            loginUrl: $loginUrl,
            resetLink: $resetLink,
        ));

        SystemLogService::log(
            'credentials_resent',
            "Credentials resent for school: {$tenant->school_name}",
            $tenant->id,
            'super_admin'
        );

        return back()
            ->with('success', 'Credentials email sent to '.$tenant->school_email.'.')
            ->with('credentials', [
                'admin_email' => $result['email'],
                'subdomain_url' => $subdomainUrl,
                'login_url' => $loginUrl,
                'reset_link' => $resetLink,
            ]);
    }

    public function show(Tenant $tenant): Response
    {
        $tenant->load('domains');
        $subscription = Subscription::where('tenant_id', $tenant->id)->latest()->first();

        $subdomain = $tenant->domains->first()?->domain;
        $centralDomain = config('tenancy.central_domains')[0];
        $schoolUrl = $subdomain
            ? "http://{$subdomain}.{$centralDomain}:8000"
            : null;

        // Run inside tenant DB to get live counts
        $counts = ['users' => 0, 'equipment' => 0, 'requests' => 0, 'transactions' => 0];
        $tenant->run(function () use (&$counts) {
            $counts['users'] = \App\Models\User::count();
            $counts['equipment'] = \App\Models\Equipment::count();
            $counts['requests'] = \App\Models\BorrowRequest::count();
            $counts['transactions'] = \App\Models\BorrowTransaction::count();
        });

        return Inertia::render('super-admin/schools/show', [
            'school' => [
                'id' => $tenant->id,
                'name' => $tenant->school_name ?? $tenant->id,
                'email' => $tenant->school_email,
                'contact_number' => $tenant->contact_number ?? '',
                'address' => $tenant->address ?? '',
                'plan' => $tenant->plan ?? 'free',
                'status' => $tenant->status ?? 'active',
                'suspension_reason' => $tenant->suspension_reason ?? null,
                'subdomain' => $subdomain,
                'school_url' => $schoolUrl,
                'created_at' => $tenant->created_at,
                'users_count' => $counts['users'],
                'equipment_count' => $counts['equipment'],
                'borrow_requests_count' => $counts['requests'],
                'borrow_transactions_count' => $counts['transactions'],
            ],
            'subscription' => $subscription,
        ]);
    }

    public function edit(Tenant $tenant): Response
    {
        return Inertia::render('super-admin/schools/edit', [
            'school' => [
                'id' => $tenant->id,
                'name' => $tenant->school_name ?? '',
                'email' => $tenant->school_email ?? '',
                'contact_number' => $tenant->contact_number ?? '',
                'address' => $tenant->address ?? '',
            ],
        ]);
    }

    public function update(Request $request, Tenant $tenant): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $tenant->update([
            'school_name' => $validated['name'],
            'school_email' => $validated['email'],
            'contact_number' => $validated['contact_number'],
            'address' => $validated['address'],
        ]);

        Mail::to($tenant->school_email)->send(new SchoolProfileUpdatedMail(
            schoolName: $validated['name'],
            adminEmail: $validated['email'],
            contactNumber: $validated['contact_number'] ?? '',
            address: $validated['address'] ?? '',
        ));

        SystemLogService::log(
            'school_updated',
            "School profile updated: {$tenant->school_name}",
            $tenant->id,
            'super_admin'
        );

        return redirect()
            ->route('super-admin.schools.show', $tenant)
            ->with('success', 'School updated successfully.');
    }

    public function suspend(Request $request, Tenant $tenant): RedirectResponse
    {
        $request->validate(['reason' => ['required', 'string', 'max:255']]);

        // Stored in the data JSON column automatically
        $tenant->update([
            'status' => 'suspended',
            'suspension_reason' => $request->reason,
        ]);

        // Immediately invalidate all active sessions in the tenant's database.
        // This kicks out currently logged-in users (admin, staff, students)
        // instantly rather than waiting for their session to expire (120 min).
        $tenant->run(function () {
            DB::table('sessions')->truncate();
        });

        $schoolName = $tenant->school_name ?? $tenant->id;
        SystemLogService::log(
            'school_suspended',
            "School suspended: {$schoolName}. Reason: {$request->reason}",
            $tenant->id,
            'super_admin'
        );

        return redirect()
            ->route('super-admin.schools.show', $tenant)
            ->with('success', 'School suspended.');
    }

    public function reactivate(Tenant $tenant): RedirectResponse
    {
        $tenant->update([
            'status' => 'active',
            'suspension_reason' => null,
        ]);

        $schoolName = $tenant->school_name ?? $tenant->id;
        SystemLogService::log(
            'school_reactivated',
            "School reactivated: {$schoolName}",
            $tenant->id,
            'super_admin'
        );

        return redirect()
            ->route('super-admin.schools.show', $tenant)
            ->with('success', 'School reactivated.');
    }
}
