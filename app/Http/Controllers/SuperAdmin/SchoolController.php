<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Services\SystemLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
