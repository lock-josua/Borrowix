<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission as SpatiePermission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RbacController extends Controller
{
    public function index(): Response
    {
        $this->authorize(Permission::RbacManage->value);

        $roles = Role::with('permissions')
            ->whereIn('name', ['admin', 'staff', 'student'])
            ->get()
            ->map(fn ($role) => [
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->values(),
            ]);

        $allPermissions = SpatiePermission::pluck('name')
            ->map(fn ($full) => [
                'full' => $full,
                'resource' => str($full)->before('.')->toString(),
                'action' => str($full)->after('.')->toString(),
            ])
            ->groupBy('resource')
            ->map(fn ($group) => $group->pluck('action')->values())
            ->map(fn ($actions, $resource) => [
                'resource' => $resource,
                'permissions' => $actions,
            ])
            ->values();

        return Inertia::render('admin/rbac/index', [
            'roles' => $roles,
            'allPermissions' => $allPermissions,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $this->authorize(Permission::RbacManage->value);

        $validated = $request->validate([
            'role' => ['required', 'string', Rule::in(['staff', 'student'])],
            'permission' => ['required', 'string', 'exists:permissions,name'],
            'grant' => ['required', 'boolean'],
        ]);

        abort_if($validated['role'] === 'admin', 403, 'Admin role is protected.');

        $role = Role::findByName($validated['role']);

        if ($validated['grant']) {
            $role->givePermissionTo($validated['permission']);
        } else {
            $role->revokePermissionTo($validated['permission']);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return response()->json([
            'ok' => true,
            'role' => $role->name,
            'permission' => $validated['permission'],
            'granted' => $validated['grant'],
        ]);
    }
}
