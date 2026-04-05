import { Head, Link } from '@inertiajs/react';
import {
    Package,
    ClipboardList,
    ArrowLeftRight,
    AlertTriangle,
    Users,
    CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
];

interface PendingRequest {
    id: number;
    requester: { name: string };
    equipment: { name: string };
    borrow_date: string;
    expected_return_date: string;
}

interface OverdueTransaction {
    id: number;
    borrower: { name: string };
    equipment: { name: string };
    due_date: string;
}

interface Stats {
    total_equipment: number;
    available_equipment: number;
    pending_requests: number;
    active_loans: number;
    overdue_loans: number;
    total_students: number;
    total_staff: number;
}

interface Props {
    stats: Stats;
    pendingRequests: PendingRequest[];
    overdueTransactions: OverdueTransaction[];
    school: { name: string; plan: string };
}

const planBadge: Record<string, string> = {
    free: 'badge-ghost',
    basic: 'badge-info',
    pro: 'badge-warning',
};

export default function AdminDashboard({
    stats,
    pendingRequests,
    overdueTransactions,
    school,
}: Props) {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {school.name}
                        </h1>
                        <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Plan:
                            </span>
                            <span
                                className={`badge badge-sm capitalize ${planBadge[school.plan] ?? 'badge-ghost'}`}
                            >
                                {school.plan}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    <StatCard
                        title="Equipment"
                        value={stats.total_equipment}
                        sub={`${stats.available_equipment} available`}
                        icon={<Package className="size-4 text-blue-500" />}
                        iconBg="bg-blue-500/10"
                    />
                    <StatCard
                        title="Pending"
                        value={stats.pending_requests}
                        sub="Awaiting approval"
                        icon={
                            <ClipboardList className="size-4 text-amber-500" />
                        }
                        iconBg="bg-amber-500/10"
                    />
                    <StatCard
                        title="Active Loans"
                        value={stats.active_loans}
                        sub="Currently borrowed"
                        icon={
                            <ArrowLeftRight className="size-4 text-cyan-500" />
                        }
                        iconBg="bg-cyan-500/10"
                    />
                    <StatCard
                        title="Overdue"
                        value={stats.overdue_loans}
                        sub="Past due date"
                        icon={<AlertTriangle className="size-4 text-red-500" />}
                        iconBg="bg-red-500/10"
                    />
                    <StatCard
                        title="Users"
                        value={stats.total_students + stats.total_staff}
                        sub={`${stats.total_students} students · ${stats.total_staff} staff`}
                        icon={<Users className="size-4 text-purple-500" />}
                        iconBg="bg-purple-500/10"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Pending Requests */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">
                                Pending Requests
                            </CardTitle>
                            <Link href="/admin/requests">
                                <Button variant="ghost" size="sm">
                                    View all
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {pendingRequests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <ClipboardList className="mb-3 size-8 text-muted-foreground/40" />
                                    <p className="font-medium text-muted-foreground">
                                        No pending requests
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Student requests will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingRequests.map((r) => (
                                        <div
                                            key={r.id}
                                            className="flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium">
                                                    {r.requester.name}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {r.equipment.name}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {new Date(
                                                        r.borrow_date,
                                                    ).toLocaleDateString()}{' '}
                                                    →{' '}
                                                    {new Date(
                                                        r.expected_return_date,
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/admin/requests/${r.id}`}
                                            >
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    Review
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Overdue */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base text-destructive">
                                Overdue Items
                            </CardTitle>
                            <Link href="/admin/transactions?status=overdue">
                                <Button variant="ghost" size="sm">
                                    View all
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {overdueTransactions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <CheckCircle className="mb-3 size-8 text-emerald-500/40" />
                                    <p className="font-medium text-muted-foreground">
                                        No overdue items
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        All equipment is returned on time.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {overdueTransactions.map((t) => (
                                        <div
                                            key={t.id}
                                            className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-900/30 dark:bg-red-950/20"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium">
                                                    {t.borrower.name}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {t.equipment.name}
                                                </p>
                                                <p className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                                    <AlertTriangle className="size-3" />
                                                    Due{' '}
                                                    {new Date(
                                                        t.due_date,
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/admin/transactions/${t.id}`}
                                            >
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                >
                                                    View
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({
    title,
    value,
    sub,
    icon,
    iconBg,
}: {
    title: string;
    value: number;
    sub?: string;
    icon: React.ReactNode;
    iconBg: string;
}) {
    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={`rounded-md p-2 ${iconBg}`}>{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                {sub && (
                    <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                )}
            </CardContent>
        </Card>
    );
}
