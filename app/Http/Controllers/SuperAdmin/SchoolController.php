<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SchoolController extends Controller
{
    public function index(Request $request): Response
    {
        $schools = Tenant::with('domains')
            ->when($request->search, fn ($q) =>
                $q->where('school_email', 'like', "%{$request->search}%")
                  ->orWhere('data->school_name', 'like', "%{$request->search}%")
            )
            ->when($request->plan,   fn ($q) => $q->where('data->plan', $request->plan))
            ->when($request->status, fn ($q) => $q->where('data->status', $request->status))
            ->latest()
            ->paginate(15)
            ->through(fn ($t) => [
                'id'             => $t->id,
                'name'           => $t->school_name ?? $t->id,
                'email'          => $t->school_email,
                'contact_number' => $t->contact_number ?? '',
                'plan'           => $t->plan ?? 'free',
                'status'         => $t->status ?? 'active',
                'subdomain'      => $t->domains->first()?->domain,
                'created_at'     => $t->created_at,
            ]);

        return Inertia::render('super-admin/schools/index', [
            'schools' => $schools,
            'filters' => $request->only(['search', 'plan', 'status']),
        ]);
    }

    public function show(Tenant $tenant): Response
    {
        $tenant->load('domains');
        $subscription = Subscription::where('tenant_id', $tenant->id)->latest()->first();

        return Inertia::render('super-admin/schools/show', [
            'school'       => $tenant,
            'subscription' => $subscription,
        ]);
    }

    public function suspend(Request $request, Tenant $tenant): RedirectResponse
    {
        $request->validate(['reason' => ['required', 'string', 'max:255']]);

        // Stored in the data JSON column automatically
        $tenant->update([
            'status'            => 'suspended',
            'suspension_reason' => $request->reason,
        ]);

        return redirect()
            ->route('super-admin.schools.show', $tenant)
            ->with('success', 'School suspended.');
    }

    public function reactivate(Tenant $tenant): RedirectResponse
    {
        $tenant->update([
            'status'            => 'active',
            'suspension_reason' => null,
        ]);

        return redirect()
            ->route('super-admin.schools.show', $tenant)
            ->with('success', 'School reactivated.');
    }

    public function impersonate(Tenant $tenant): RedirectResponse
    {
        // Use $tenant->run() to query the tenant's database for the admin user
        $admin = null;
        $tenant->run(function () use (&$admin) {
            $admin = User::where('role', 'admin')->firstOrFail();
        });

        session(['impersonating_from' => Auth::id()]);
        Auth::login($admin);

        $subdomain     = $tenant->domains()->first()?->domain;
        $centralDomain = config('tenancy.central_domains')[0];

        return redirect("http://{$subdomain}.{$centralDomain}/admin/dashboard");
    }
}
