import { Head } from '@inertiajs/react';
import {
    School,
    Users,
    ShieldAlert,
    BarChart3,
    CheckCircle,
    TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
];

interface RecentSchool {
    id: number;
    name: string;
    email: string;
    plan: string;
    status: string;
    created_at: string;
}

interface Stats {
    total_schools: number;
    active_schools: number;
    suspended_schools: number;
    total_users: number;
    total_students: number;
    total_staff: number;
    plan_breakdown: Record<string, number>;
}

interface Props {
    stats: Stats;
    recentSchools: RecentSchool[];
}

const planColor: Record<string, string> = {
    free: 'bg-base-200 text-base-content',
    basic: 'bg-info/10 text-info',
    pro: 'bg-warning/10 text-warning',
};

const statusColor: Record<string, string> = {
    active: 'badge-success',
    suspended: 'badge-error',
    canceled: 'badge-neutral',
};

export default function SuperAdminDashboard({ stats, recentSchools }: Props) {
    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Super Admin Dashboard" />

            <div className="flex flex-col gap-6 p-6">

                {/* Page Title */}
                <div>
                    <h1 className="text-2xl font-bold">Platform Overview</h1>
                    <p className="text-sm text-muted-foreground">
                        Monitor all schools and subscriptions across the platform.
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Schools"
                        value={stats.total_schools}
                        icon={<School className="size-5 text-primary" />}
                        sub="Registered tenants"
                    />
                    <StatCard
                        title="Active Schools"
                        value={stats.active_schools}
                        icon={<CheckCircle className="size-5 text-success" />}
                        sub="Currently active"
                    />
                    <StatCard
                        title="Suspended"
                        value={stats.suspended_schools}
                        icon={<ShieldAlert className="size-5 text-error" />}
                        sub="Blocked accounts"
                    />
                    <StatCard
                        title="Total Users"
                        value={stats.total_users}
                        icon={<Users className="size-5 text-secondary" />}
                        sub={`${stats.total_students} students · ${stats.total_staff} staff`}
                    />
                </div>

                {/* Plan Breakdown + Recent Schools */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Plan Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BarChart3 className="size-4" />
                                Plan Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {['free', 'basic', 'pro'].map((plan) => (
                                <div key={plan} className="flex items-center justify-between">
                                    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${planColor[plan]}`}>
                                        {plan}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-primary transition-all"
                                                style={{
                                                    width: `${stats.total_schools > 0
                                                        ? ((stats.plan_breakdown[plan] ?? 0) / stats.total_schools) * 100
                                                        : 0}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="w-6 text-right text-sm font-medium">
                                            {stats.plan_breakdown[plan] ?? 0}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent Schools */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="size-4" />
                                Recently Registered Schools
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="table table-sm w-full">
                                    <thead>
                                        <tr className="text-muted-foreground">
                                            <th>School</th>
                                            <th>Plan</th>
                                            <th>Status</th>
                                            <th>Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentSchools.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center text-muted-foreground py-4">
                                                    No schools yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            recentSchools.map((school) => (
                                                <tr key={school.id} className="hover">
                                                    <td>
                                                        <div className="font-medium">{school.name}</div>
                                                        <div className="text-xs text-muted-foreground">{school.email}</div>
                                                    </td>
                                                    <td>
                                                        <span className={`rounded px-2 py-0.5 text-xs font-semibold capitalize ${planColor[school.plan]}`}>
                                                            {school.plan}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-sm ${statusColor[school.status]}`}>
                                                            {school.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-xs text-muted-foreground">
                                                        {new Date(school.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SuperAdminLayout>
    );
}

// Reusable stat card component
function StatCard({
    title,
    value,
    icon,
    sub,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    sub?: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{value.toLocaleString()}</div>
                {sub && (
                    <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                )}
            </CardContent>
        </Card>
    );
}