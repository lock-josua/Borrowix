import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Pencil, Search, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Users', href: '/admin/users' },
];

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    status?: string;
}

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    filters: { search?: string; role?: string };
}

export default function UsersIndex({ users, filters }: Props) {
    const { can } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/admin/users', { ...filters, search }, { preserveState: true });
    }

    function handleFilterChange(key: string, value: string) {
        router.get('/admin/users', { ...filters, [key]: value || undefined }, { preserveState: true });
    }

    function handleDelete() {
        if (!deleteTarget) return;
        router.delete(`/admin/users/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Users"
                    description="Manage staff and students."
                    actions={
                        can.manage_users && (
                            <Button asChild size="sm" className="gap-1.5">
                                <Link href="/admin/users/invite">
                                    <UserPlus className="size-3.5" />
                                    Add User
                                </Link>
                            </Button>
                        )
                    }
                />

                {/* Filter bar */}
                <Card className="flex flex-row flex-wrap items-center gap-2 p-3 py-3">
                    <form onSubmit={handleSearch} className="relative min-w-[220px] flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                            className="pl-8 h-9 text-sm bg-muted/20"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                    <Select value={filters.role ?? 'all'} onValueChange={(v) => handleFilterChange('role', v === 'all' ? '' : v)}>
                        <SelectTrigger className="h-9 w-[150px] text-sm bg-muted/20">
                            <SelectValue placeholder="All roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All roles</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                    </Select>
                </Card>

                {/* Table */}
                <Card className="overflow-hidden p-0 border-border/60">
                    <DataTable
                        columns={[
                            {
                                key: 'name',
                                label: 'Name',
                                width: '28%',
                                render: (u) => <span className="font-medium text-foreground truncate block">{u.name}</span>,
                            },
                            {
                                key: 'email',
                                label: 'Email',
                                width: '28%',
                                render: (u) => <span className="text-muted-foreground truncate block">{u.email}</span>,
                            },
                            {
                                key: 'role',
                                label: 'Role',
                                width: '14%',
                                render: (u) => <StatusBadge status={u.role} />,
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                width: '12%',
                                align: 'center',
                                render: (u) => <StatusBadge status={u.status ?? 'active'} />,
                            },
                            {
                                key: 'joined',
                                label: 'Joined',
                                width: '12%',
                                render: (u) => <span className="text-muted-foreground text-xs">{u.created_at}</span>,
                            },
                            {
                                key: 'actions',
                                label: '',
                                width: '6%',
                                align: 'right',
                                render: (u) => (
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="size-7" asChild>
                                            <Link href={`/admin/users/${u.id}/edit`}>
                                                <Pencil className="size-3.5" />
                                            </Link>
                                        </Button>
                                        {can.manage_users && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7 hover:text-destructive"
                                                onClick={() => setDeleteTarget(u)}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        data={users.data}
                        keyExtractor={(u) => u.id}
                    />
                    <TablePagination
                        currentPage={users.current_page}
                        lastPage={users.last_page}
                        nextUrl={users.next_page_url}
                        prevUrl={users.prev_page_url}
                    />
                </Card>

                <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remove {deleteTarget?.name}?</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">This user will be permanently removed from your school.</p>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Remove
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </AdminLayout>
    );
}
