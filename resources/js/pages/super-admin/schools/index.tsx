import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, ShieldAlert, ShieldCheck, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
    { title: 'Schools', href: '/super-admin/schools' },
];

interface School {
    id: string;
    name: string;
    email: string;
    plan: string;
    status: string;
    subdomain: string | null;
    school_url: string | null;
    created_at: string;
    users_count: number;
    equipment_count: number;
}

interface PaginatedSchools {
    data: School[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Props {
    schools: PaginatedSchools;
    filters: { search?: string; plan?: string; status?: string };
}

const planBadge: Record<string, string> = {
    free: 'badge-ghost',
    basic: 'badge-info',
    pro: 'badge-warning',
};

const statusBadge: Record<string, string> = {
    active: 'badge-success',
    suspended: 'badge-error',
    canceled: 'badge-neutral',
};

export default function SchoolsIndex({ schools, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [suspendTarget, setSuspendTarget] = useState<School | null>(null);
    const [reason, setReason] = useState('');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/super-admin/schools', { search }, { preserveState: true });
    }

    function handleSuspend() {
        if (!suspendTarget) return;
        router.post(
            `/super-admin/schools/${suspendTarget.id}/suspend`,
            { reason },
            {
                onSuccess: () => {
                    setSuspendTarget(null);
                    setReason('');
                },
            },
        );
    }

    function handleReactivate(school: School) {
        router.post(`/super-admin/schools/${school.id}/reactivate`);
    }

    function handleImpersonate(school: School) {
        router.post(`/super-admin/schools/${school.id}/impersonate`);
    }

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Schools" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Schools</h1>
                        <p className="text-sm text-muted-foreground">
                            All registered schools on the platform.
                        </p>
                    </div>
                </div>

                {/* Search */}
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
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {schools.data.length} school
                            {schools.data.length !== 1 ? 's' : ''} found
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="table-sm table w-full">
                                <thead>
                                    <tr className="text-muted-foreground">
                                        <th>School</th>
                                        <th>Plan</th>
                                        <th>Status</th>
                                        <th>Users</th>
                                        <th>Equipment</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schools.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No schools found.
                                            </td>
                                        </tr>
                                    ) : (
                                        schools.data.map((school) => (
                                            <tr
                                                key={school.id}
                                                className="hover"
                                            >
                                                <td>
                                                    <div className="font-medium">
                                                        {school.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {school.email}
                                                    </div>
                                                    {school.school_url && (
                                                        <a
                                                            href={
                                                                school.school_url
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-primary underline hover:opacity-80"
                                                        >
                                                            {school.subdomain}
                                                            .localhost
                                                        </a>
                                                    )}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge badge-sm capitalize ${planBadge[school.plan]}`}
                                                    >
                                                        {school.plan}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge badge-sm capitalize ${statusBadge[school.status]}`}
                                                    >
                                                        {school.status}
                                                    </span>
                                                </td>
                                                <td>{school.users_count}</td>
                                                <td>
                                                    {school.equipment_count}
                                                </td>
                                                <td className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        school.created_at,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-1">
                                                        <Link
                                                            href={`/super-admin/schools/${school.id}`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="View"
                                                            >
                                                                <Eye className="size-4" />
                                                            </Button>
                                                        </Link>
                                                        {school.status ===
                                                        'active' ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Suspend"
                                                                onClick={() =>
                                                                    setSuspendTarget(
                                                                        school,
                                                                    )
                                                                }
                                                            >
                                                                <ShieldAlert className="size-4 text-destructive" />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Reactivate"
                                                                onClick={() =>
                                                                    handleReactivate(
                                                                        school,
                                                                    )
                                                                }
                                                            >
                                                                <ShieldCheck className="size-4 text-green-500" />
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

                        {/* Pagination */}
                        {schools.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-2">
                                {schools.prev_page_url && (
                                    <Link href={schools.prev_page_url}>
                                        <Button variant="outline" size="sm">
                                            Previous
                                        </Button>
                                    </Link>
                                )}
                                <span className="flex items-center text-sm text-muted-foreground">
                                    Page {schools.current_page} of{' '}
                                    {schools.last_page}
                                </span>
                                {schools.next_page_url && (
                                    <Link href={schools.next_page_url}>
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

            {/* Suspend Dialog */}
            <Dialog
                open={!!suspendTarget}
                onOpenChange={() => setSuspendTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Suspend {suspendTarget?.name}?
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        All users of this school will be locked out immediately.
                    </p>
                    <Input
                        placeholder="Reason for suspension..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSuspendTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleSuspend}
                            disabled={!reason}
                        >
                            Suspend School
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SuperAdminLayout>
    );
}
