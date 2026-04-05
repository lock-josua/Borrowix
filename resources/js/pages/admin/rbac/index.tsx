import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { ShieldCheck, Lock, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

interface PermissionGroup {
    resource: string;
    permissions: string[];
}

interface Role {
    name: string;
    permissions: string[];
}

interface Props {
    roles: Role[];
    allPermissions: PermissionGroup[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'RBAC', href: '/admin/rbac' },
];

const roleColors: Record<string, string> = {
    admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    staff: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    student:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};

const rolePermissionMap: Record<string, string[]> = {
    admin: [],
    staff: ['equipment', 'transaction', 'request'],
    student: ['equipment', 'request'],
};

function hasPermission(
    permission: string,
    role: Role,
    overrides: Map<string, Map<string, boolean>>,
): boolean {
    const roleOverrides = overrides.get(role.name);
    if (roleOverrides?.has(permission) !== undefined) {
        return roleOverrides.get(permission) ?? false;
    }

    return role.permissions.includes(permission);
}

export default function RbacIndex({ roles, allPermissions }: Props) {
    const [pending, setPending] = useState<Set<string>>(new Set());
    const [overrides, setOverrides] = useState<
        Map<string, Map<string, boolean>>
    >(() => new Map(roles.map((r) => [r.name, new Map()])));
    const [filter, setFilter] = useState<string>('all');

    const visibleRoles =
        filter === 'all' ? roles : roles.filter((r) => r.name === filter);

    const visiblePermissions =
        filter === 'all'
            ? allPermissions
            : allPermissions.filter((g) =>
                  rolePermissionMap[filter]?.includes(g.resource),
              );

    async function handleToggle(
        roleName: string,
        permission: string,
        checked: boolean,
    ) {
        const key = `${roleName}:${permission}`;
        setPending((prev) => new Set(prev).add(key));

        const roleOverrides = overrides.get(roleName) ?? new Map();
        roleOverrides.set(permission, checked);
        setOverrides(new Map(overrides).set(roleName, roleOverrides));

        try {
            const response = await fetch('/admin/rbac', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content,
                },
                body: JSON.stringify({
                    role: roleName,
                    permission,
                    grant: checked,
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null);
                throw new Error(
                    error?.message ?? 'Failed to update permission',
                );
            }

            toast.success(
                `${roleName} ${checked ? 'granted' : 'revoked'} ${permission}`,
            );
        } catch (error) {
            roleOverrides.set(permission, !checked);
            setOverrides(new Map(overrides).set(roleName, roleOverrides));
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to update permission',
            );
        } finally {
            setPending((prev) => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }
    }

    function isPending(roleName: string, permission: string): boolean {
        return pending.has(`${roleName}:${permission}`);
    }

    const filterOptions = ['all', 'admin', 'staff', 'student'];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="RBAC Permissions" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                            <ShieldCheck className="size-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Role Permissions
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Manage permissions for each role. Changes take
                                effect immediately.
                            </p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                {filterOptions.map((option) => (
                                    <Button
                                        key={option}
                                        size="sm"
                                        variant={
                                            filter === option
                                                ? 'default'
                                                : 'outline'
                                        }
                                        onClick={() => setFilter(option)}
                                    >
                                        {option === 'all'
                                            ? 'All Roles'
                                            : option.charAt(0).toUpperCase() +
                                              option.slice(1)}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <div className="size-2 rounded-full bg-green-500" />
                                    Granted
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="size-2 rounded-full bg-muted-foreground/30" />
                                    Revoked
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Lock className="size-3" />
                                    Protected
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[220px] pl-6">
                                        Permission
                                    </TableHead>
                                    {visibleRoles.map((role) => (
                                        <TableHead
                                            key={role.name}
                                            className="w-[120px] text-center"
                                        >
                                            <Badge
                                                variant="outline"
                                                className={`gap-1.5 font-semibold ${roleColors[role.name] ?? ''}`}
                                            >
                                                {role.name === 'admin' && (
                                                    <Lock className="size-3" />
                                                )}
                                                {role.name
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    role.name.slice(1)}
                                            </Badge>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visiblePermissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={visibleRoles.length + 1}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            No permissions to display for this
                                            role.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    visiblePermissions.map((group) => (
                                        <>
                                            <TableRow
                                                key={`group-${group.resource}`}
                                                className="bg-muted/40"
                                            >
                                                <TableCell
                                                    colSpan={
                                                        visibleRoles.length + 1
                                                    }
                                                    className="py-2.5 pl-6"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-1 rounded-full bg-primary" />
                                                        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                            {group.resource}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {group.permissions.map((action) => {
                                                const fullPermission = `${group.resource}.${action}`;

                                                return (
                                                    <TableRow
                                                        key={fullPermission}
                                                        className="transition-colors hover:bg-muted/30"
                                                    >
                                                        <TableCell className="pl-8 text-sm font-medium">
                                                            {action}
                                                        </TableCell>
                                                        {visibleRoles.map(
                                                            (role) => {
                                                                const granted =
                                                                    hasPermission(
                                                                        fullPermission,
                                                                        role,
                                                                        overrides,
                                                                    );
                                                                const isPendingState =
                                                                    isPending(
                                                                        role.name,
                                                                        fullPermission,
                                                                    );
                                                                const isAdmin =
                                                                    role.name ===
                                                                    'admin';
                                                                const isDisabled =
                                                                    isAdmin ||
                                                                    isPendingState;

                                                                return (
                                                                    <TableCell
                                                                        key={`${role.name}-${fullPermission}`}
                                                                        className="text-center"
                                                                    >
                                                                        <div className="flex items-center justify-center gap-2">
                                                                            {granted &&
                                                                                !isPendingState && (
                                                                                    <div className="flex size-4 items-center justify-center rounded-full bg-green-500/10">
                                                                                        <Check className="size-3 text-green-600 dark:text-green-400" />
                                                                                    </div>
                                                                                )}
                                                                            {!granted &&
                                                                                !isPendingState && (
                                                                                    <div className="size-4 rounded-full bg-muted" />
                                                                                )}
                                                                            {isAdmin ? (
                                                                                <Lock className="size-3.5 text-muted-foreground/50" />
                                                                            ) : (
                                                                                <Switch
                                                                                    aria-label={`${role.name} - ${fullPermission}`}
                                                                                    checked={
                                                                                        granted
                                                                                    }
                                                                                    disabled={
                                                                                        isDisabled
                                                                                    }
                                                                                    size="sm"
                                                                                    onCheckedChange={(
                                                                                        checked,
                                                                                    ) => {
                                                                                        handleToggle(
                                                                                            role.name,
                                                                                            fullPermission,
                                                                                            checked,
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                );
                                                            },
                                                        )}
                                                    </TableRow>
                                                );
                                            })}
                                        </>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
