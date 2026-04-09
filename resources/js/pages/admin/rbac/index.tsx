import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
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

const ROLE_PERMISSION_GROUPS: Record<string, string[]> = {
    admin: [
        'category',
        'equipment',
        'history',
        'report',
        'request',
        'rbac',
        'settings',
        'subscription',
        'transaction',
        'user',
    ],
    staff: ['equipment', 'history', 'request', 'transaction'],
    student: ['equipment', 'history', 'request'],
};

export default function RbacIndex({ roles, allPermissions }: Props) {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [pending, setPending] = useState<Set<string>>(new Set());

    const currentRole = roles.find((r) => r.name === selectedRole);

    const allowedGroups = selectedRole
        ? (ROLE_PERMISSION_GROUPS[selectedRole] ?? [])
        : [];
    const filteredPermissions = allPermissions.filter((group) =>
        allowedGroups.includes(group.resource),
    );

    async function handleToggle(
        roleName: string,
        permission: string,
        checked: boolean,
    ) {
        const key = `${roleName}:${permission}`;
        setPending((prev) => new Set(prev).add(key));

        router.patch(
            '/admin/rbac',
            {
                role: roleName,
                permission,
                grant: checked,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPending((prev) => {
                        const next = new Set(prev);
                        next.delete(key);
                        return next;
                    });
                    toast.success(
                        `${roleName} ${checked ? 'granted' : 'revoked'}: ${permission}`,
                    );
                },
                onError: () => {
                    setPending((prev) => {
                        const next = new Set(prev);
                        next.delete(key);
                        return next;
                    });
                    toast.error('Failed to update permission');
                },
            },
        );
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="RBAC Permissions" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Role Permissions"
                    description="Manage permissions for each role."
                />

                {/* Table */}
                <Card className="overflow-hidden border-border/60 p-0">
                    <DataTable
                        columns={[
                            {
                                key: 'role',
                                label: 'Role',
                                width: '22%',
                                render: (role) => (
                                    <span className="font-semibold text-foreground capitalize">
                                        {role.name}
                                    </span>
                                ),
                            },
                            {
                                key: 'permissions',
                                label: 'Permissions',
                                width: '60%',
                                render: (role) => (
                                    <div className="flex flex-wrap gap-1">
                                        {role.name === 'admin' ? (
                                            <span className="text-xs font-medium text-emerald-600">
                                                All Permissions Granted
                                            </span>
                                        ) : role.name === 'staff' ? (
                                            <span className="block truncate text-xs text-muted-foreground">
                                                Staff permission
                                            </span>
                                        ) : role.name === 'student' &&
                                          role.permissions.length > 0 ? (
                                            <span className="block truncate text-xs text-muted-foreground">
                                                {role.permissions.join(', ')}
                                            </span>
                                        ) : role.name === 'student' ? (
                                            <span className="block truncate text-xs text-muted-foreground">
                                                No permissions granted
                                            </span>
                                        ) : (
                                            <span className="block truncate text-xs text-muted-foreground">
                                                {role.permissions.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: 'actions',
                                label: '',
                                width: '18%',
                                align: 'right',
                                render: (role) =>
                                    role.name !== 'admin' ? (
                                        <Button
                                            variant={
                                                selectedRole === role.name
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            onClick={() =>
                                                setSelectedRole(role.name)
                                            }
                                        >
                                            {selectedRole === role.name
                                                ? 'Managing'
                                                : 'Manage'}
                                        </Button>
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">
                                            Protected
                                        </span>
                                    ),
                            },
                        ]}
                        data={roles}
                        keyExtractor={(role) => role.name}
                    />
                </Card>

                {/* Permission Management Panel */}
                {selectedRole && currentRole && (
                    <Card className="overflow-hidden border-border/60 p-0">
                        <div className="flex items-center gap-2 border-b px-6 py-4">
                            <ShieldCheck className="size-5 text-primary" />
                            <h3 className="font-semibold capitalize">
                                {currentRole.name} Permissions
                            </h3>
                            {currentRole.name === 'admin' && (
                                <span className="ml-auto text-xs text-muted-foreground">
                                    Read-only
                                </span>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedRole(null)}
                            >
                                Close
                            </Button>
                        </div>
                        <ScrollArea className="h-[60vh]">
                            <div className="space-y-8 p-6">
                                {filteredPermissions.map((group) => (
                                    <div
                                        key={group.resource}
                                        className="space-y-4"
                                    >
                                        <h4 className="px-1 text-[11px] font-bold tracking-widest text-muted-foreground/70 uppercase">
                                            {group.resource}
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {group.permissions.map((action) => {
                                                const fullPermission = `${group.resource}.${action}`;
                                                const granted =
                                                    currentRole.permissions.includes(
                                                        fullPermission,
                                                    );
                                                const isPending = pending.has(
                                                    `${currentRole.name}:${fullPermission}`,
                                                );
                                                const isAdmin =
                                                    currentRole.name ===
                                                    'admin';
                                                const isStudent =
                                                    currentRole.name ===
                                                    'student';
                                                const isLockedForStudent =
                                                    isStudent &&
                                                    ((group.resource ===
                                                        'equipment' &&
                                                        [
                                                            'create',
                                                            'update',
                                                            'delete',
                                                        ].includes(action)) ||
                                                        (group.resource ===
                                                            'request' &&
                                                            [
                                                                'approve',
                                                                'reject',
                                                            ].includes(
                                                                action,
                                                            )));

                                                return (
                                                    <div
                                                        key={fullPermission}
                                                        className="flex items-center justify-between rounded-lg border bg-muted/20 p-3"
                                                    >
                                                        <div className="text-sm font-medium capitalize">
                                                            {action}
                                                        </div>
                                                        <Switch
                                                            checked={
                                                                granted ?? false
                                                            }
                                                            disabled={
                                                                isPending ||
                                                                isAdmin ||
                                                                isLockedForStudent
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) => {
                                                                if (
                                                                    isLockedForStudent
                                                                ) {
                                                                    toast.error(
                                                                        'This permission is locked for students',
                                                                    );
                                                                    return;
                                                                }
                                                                if (
                                                                    isPending ||
                                                                    isAdmin
                                                                ) {
                                                                    return;
                                                                }
                                                                handleToggle(
                                                                    currentRole.name,
                                                                    fullPermission,
                                                                    checked,
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </Card>
                )}
            </motion.div>
        </AdminLayout>
    );
}
