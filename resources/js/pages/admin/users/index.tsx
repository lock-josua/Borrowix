import { Head, Link, router, usePage } from '@inertiajs/react';
import { UserPlus, Pencil, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
        router.get(
            '/admin/users',
            {
                search,
                role: filters.role,
            },
            { preserveState: true },
        );
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

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Users</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage staff and students.
                        </p>
                    </div>
                    {can.manage_users && (
                        <Link href="/admin/users/invite">
                            <Button>
                                <UserPlus className="mr-2 size-4" />
                                Add User
                            </Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardContent className="pt-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-sm"
                            />
                            <Button type="submit" variant="outline" size="icon">
                                <Search className="size-4" />
                            </Button>
                            <div className="ml-auto flex gap-2">
                                {['', 'staff', 'student'].map((r) => (
                                    <Button
                                        key={r}
                                        size="sm"
                                        type="button"
                                        variant={
                                            filters.role === r ||
                                            (!filters.role && r === '')
                                                ? 'default'
                                                : 'outline'
                                        }
                                        onClick={() =>
                                            router.get(
                                                '/admin/users',
                                                {
                                                    search,
                                                    role: r,
                                                },
                                                { preserveState: true },
                                            )
                                        }
                                    >
                                        {r === ''
                                            ? 'All'
                                            : r.charAt(0).toUpperCase() +
                                              r.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {users.data.length} users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="table-sm table w-full">
                                <thead>
                                    <tr className="text-muted-foreground">
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((u) => (
                                            <tr key={u.id} className="hover">
                                                <td className="font-medium">
                                                    {u.name}
                                                </td>
                                                <td className="text-muted-foreground">
                                                    {u.email}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge badge-sm capitalize ${u.role === 'staff' ? 'badge-info' : 'badge-ghost'}`}
                                                    >
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        u.created_at,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <Link
                                                            href={`/admin/users/${u.id}`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                            >
                                                                <Pencil className="size-4" />
                                                            </Button>
                                                        </Link>
                                                        {can.manage_users && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    setDeleteTarget(
                                                                        u,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="size-4 text-destructive" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {users.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-2">
                                {users.prev_page_url && (
                                    <Link href={users.prev_page_url}>
                                        <Button variant="outline" size="sm">
                                            Previous
                                        </Button>
                                    </Link>
                                )}
                                <span className="flex items-center text-sm text-muted-foreground">
                                    Page {users.current_page} of{' '}
                                    {users.last_page}
                                </span>
                                {users.next_page_url && (
                                    <Link href={users.next_page_url}>
                                        <Button variant="outline" size="sm">
                                            Next
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={!!deleteTarget}
                onOpenChange={() => setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove {deleteTarget?.name}?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        This user will be permanently removed from your school.
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
