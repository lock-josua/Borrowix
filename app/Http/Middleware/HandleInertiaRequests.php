<?php

namespace App\Http\Middleware;

use App\Enums\Permission;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'version' => config('app.version'),
            'auth' => [
                'user' => $request->user(),
            ],
            'unread_count' => tenant() && $request->user()
                ? $request->user()->unreadNotifications->count()
                : 0,
            'notifications' => tenant() && $request->user()
                ? $request->user()->notifications()
                    ->latest()
                    ->limit(8)
                    ->get()
                    ->map(fn ($n) => [
                        'id' => $n->id,
                        'title' => $n->data['title'] ?? 'Notification',
                        'message' => $n->data['message'] ?? '',
                        'action_url' => $n->data['action_url'] ?? '/dashboard',
                        'read_at' => $n->read_at?->toIso8601String(),
                        'created_at' => $n->created_at->toIso8601String(),
                    ])
                : [],
            'can' => tenant() && $request->user() ? [
                'manage_equipment' => $request->user()->can(Permission::EquipmentCreate->value),
                'delete_equipment' => $request->user()->can(Permission::EquipmentDelete->value),
                'can_scan' => $request->user()->can(Permission::EquipmentScan->value),
                'approve_requests' => $request->user()->can(Permission::RequestApprove->value),
                'reject_requests' => $request->user()->can(Permission::RequestReject->value),
                'create_request' => $request->user()->can(Permission::RequestCreate->value),
                'process_returns' => $request->user()->can(Permission::TransactionReturn->value),
                'manage_users' => $request->user()->can(Permission::UserCreate->value),
                'view_reports' => $request->user()->can(Permission::ReportView->value),
                'manage_rbac' => $request->user()->can(Permission::RbacManage->value),
            ] : [],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'tenantSubscription' => tenant() ? (function () {
                $sub = Subscription::where('tenant_id', tenant()->id)
                    ->latest()
                    ->first(['status', 'plan', 'trial_ends_at', 'trial_warning_sent']);

                return $sub ? [
                    'status' => $sub->status,
                    'plan' => $sub->plan,
                    'trial_ends_at' => $sub->trial_ends_at?->toISOString(),
                    'trial_days_remaining' => $sub->trialDaysRemaining(),
                ] : null;
            })() : null,
            'tenant' => tenant() ? [
                'logo_url' => tenant()->logo_path
                                ? (str_starts_with(tenant()->logo_path, 'http')
                                    ? tenant()->logo_path  // Full secure_url from new upload
                                    : Storage::url(tenant()->logo_path))  // Legacy path
                                : null,
                'primary_color' => tenant()->primary_color ?? '#EA580C',
                'school_name' => tenant()->school_name ?? config('app.name'),
            ] : null,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
        ];
    }
}
