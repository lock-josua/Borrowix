import { Head, Link } from '@inertiajs/react';
import { Package, ClipboardList, ArrowLeftRight, AlertTriangle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

export default function AdminDashboard({ stats, pendingRequests, overdueTransactions, school }: Props) {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{school.name}</h1>
                        <p className="text-sm text-muted-foreground capitalize">
                            Plan: <span className="font-medium">{school.plan}</span>
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    <StatCard title="Equipment"       value={stats.total_equipment}    sub={`${stats.available_equipment} available`} icon={<Package className="size-5 text-primary" />} />
                    <StatCard title="Pending"         value={stats.pending_requests}   sub="Awaiting approval"                        icon={<ClipboardList className="size-5 text-warning" />} />
                    <StatCard title="Active Loans"    value={stats.active_loans}       sub="Currently borrowed"                       icon={<ArrowLeftRight className="size-5 text-info" />} />
                    <StatCard title="Overdue"         value={stats.overdue_loans}      sub="Past due date"                            icon={<AlertTriangle className="size-5 text-error" />} />
                    <StatCard title="Users"           value={stats.total_students + stats.total_staff} sub={`${stats.total_students} students · ${stats.total_staff} staff`} icon={<Users className="size-5 text-secondary" />} />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Pending Requests */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Pending Requests</CardTitle>
                            <Link href="/admin/requests">
                                <Button variant="ghost" size="sm">View all</Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {pendingRequests.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">No pending requests.</p>
                            ) : (
                                <div className="space-y-3">
                                    {pendingRequests.map((r) => (
                                        <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <p className="text-sm font-medium">{r.requester.name}</p>
                                                <p className="text-xs text-muted-foreground">{r.equipment.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(r.borrow_date).toLocaleString()} → {new Date(r.expected_return_date).toLocaleString()}
                                                </p>
                                            </div>
                                            <Link href={`/admin/requests/${r.id}`}>
                                                <Button size="sm">Review</Button>
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
                            <CardTitle className="text-base text-destructive">Overdue Items</CardTitle>
                            <Link href="/admin/transactions?status=overdue">
                                <Button variant="ghost" size="sm">View all</Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {overdueTransactions.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">No overdue items</p>
                            ) : (
                                <div className="space-y-3">
                                    {overdueTransactions.map((t) => (
                                        <div key={t.id} className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                                            <div>
                                                <p className="text-sm font-medium">{t.borrower.name}</p>
                                                <p className="text-xs text-muted-foreground">{t.equipment.name}</p>
                                                <p className="text-xs text-destructive">
                                                    Due: {new Date(t.due_date).toLocaleString()}
                                                </p>
                                            </div>
                                            <Link href={`/admin/transactions/${t.id}`}>
                                                <Button size="sm" variant="destructive">View</Button>
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

function StatCard({ title, value, sub, icon }: { title: string; value: number; sub?: string; icon: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{value}</div>
                {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
            </CardContent>
        </Card>
    );
}