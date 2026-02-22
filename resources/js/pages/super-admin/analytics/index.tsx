import { Head } from '@inertiajs/react';
import { School, Users, Package, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
    { title: 'Analytics', href: '/super-admin/analytics' },
];

interface MonthlyData {
    month: string;
    total: number;
}

interface TopSchool {
    id: number;
    name: string;
    plan: string;
    borrow_transactions_count: number;
}

interface Totals {
    schools: number;
    users: number;
    equipment: number;
    transactions: number;
    overdue: number;
}

interface Props {
    schoolsGrowth: MonthlyData[];
    borrowingActivity: MonthlyData[];
    topSchools: TopSchool[];
    totals: Totals;
}

const planBadge: Record<string, string> = {
    free: 'badge-ghost',
    basic: 'badge-info',
    pro: 'badge-warning',
};

export default function Analytics({ schoolsGrowth, borrowingActivity, topSchools, totals }: Props) {
    const maxBorrowing = Math.max(...borrowingActivity.map((d) => d.total), 1);
    const maxGrowth = Math.max(...schoolsGrowth.map((d) => d.total), 1);

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">Platform Analytics</h1>
                    <p className="text-sm text-muted-foreground">
                        Platform-wide usage and growth metrics.
                    </p>
                </div>

                {/* Totals */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {[
                        { label: 'Schools',      value: totals.schools,      icon: <School className="size-4 text-primary" /> },
                        { label: 'Users',        value: totals.users,        icon: <Users className="size-4 text-secondary" /> },
                        { label: 'Equipment',    value: totals.equipment,    icon: <Package className="size-4 text-accent" /> },
                        { label: 'Transactions', value: totals.transactions, icon: <ArrowLeftRight className="size-4 text-info" /> },
                        { label: 'Overdue',      value: totals.overdue,      icon: <AlertTriangle className="size-4 text-error" /> },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardHeader className="flex flex-row items-center justify-between pb-1">
                                <CardTitle className="text-xs text-muted-foreground">{s.label}</CardTitle>
                                {s.icon}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{s.value.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* School Growth Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">New Schools (Last 6 Months)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BarChart data={schoolsGrowth} max={maxGrowth} color="bg-primary" />
                        </CardContent>
                    </Card>

                    {/* Borrowing Activity Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Borrowing Activity (Last 6 Months)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BarChart data={borrowingActivity} max={maxBorrowing} color="bg-secondary" />
                        </CardContent>
                    </Card>
                </div>

                {/* Top Schools */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Most Active Schools</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="table table-sm w-full">
                                <thead>
                                    <tr className="text-muted-foreground">
                                        <th>#</th>
                                        <th>School</th>
                                        <th>Plan</th>
                                        <th>Transactions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topSchools.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-6 text-center text-muted-foreground">
                                                No data yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        topSchools.map((school, i) => (
                                            <tr key={school.id} className="hover">
                                                <td className="text-muted-foreground">{i + 1}</td>
                                                <td className="font-medium">{school.name}</td>
                                                <td>
                                                    <span className={`badge badge-sm capitalize ${planBadge[school.plan]}`}>
                                                        {school.plan}
                                                    </span>
                                                </td>
                                                <td>{school.borrow_transactions_count}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}

// Simple CSS bar chart — no external chart library needed
function BarChart({ data, max, color }: { data: MonthlyData[]; max: number; color: string }) {
    if (data.length === 0) {
        return <p className="py-6 text-center text-sm text-muted-foreground">No data yet.</p>;
    }

    return (
        <div className="flex items-end gap-2 h-32">
            {data.map((d) => (
                <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-medium">{d.total}</span>
                    <div
                        className={`w-full rounded-t ${color} transition-all`}
                        style={{ height: `${(d.total / max) * 100}px`, minHeight: '4px' }}
                    />
                    <span className="text-xs text-muted-foreground">
                        {d.month.slice(5)} {/* Show MM only */}
                    </span>
                </div>
            ))}
        </div>
    );
}