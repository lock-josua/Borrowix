<?php

namespace App\Http\Middleware;

use App\Enums\Permission;
use Illuminate\Http\Request;
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
            'auth' => [
                'user' => $request->user(),
            ],
            'can' => tenant() && $request->user() ? [
                'manage_equipment' => $request->user()->can(Permission::EquipmentCreate->value),
                'delete_equipment' => $request->user()->can(Permission::EquipmentDelete->value),
                'approve_requests' => $request->user()->can(Permission::RequestApprove->value),
                'reject_requests' => $request->user()->can(Permission::RequestReject->value),
                'create_request' => $request->user()->can(Permission::RequestCreate->value),
                'process_returns' => $request->user()->can(Permission::TransactionReturn->value),
                'manage_users' => $request->user()->can(Permission::UserCreate->value),
                'view_reports' => $request->user()->can(Permission::ReportView->value),
                'manage_rbac' => $request->user()->can(Permission::RbacManage->value),
            ] : [],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
        ];
    }
}
