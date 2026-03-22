import { Head, Link } from '@inertiajs/react';
import {
    School,
    Users,
    ShieldAlert,
    BarChart3,
    CheckCircle,
    TrendingUp,
    ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
];

interface RecentSchool {
    id: string;
    name: string;
    school_email: string;
    school_url: string | null;
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

const statusBadge: Record<string, string> = {
    active: 'badge-success',
    suspended: 'badge-error',
    canceled: 'badge-neutral',
};

const planBadge: Record<string, string> = {
    free: 'badge-ghost',
    basic: 'badge-info',
    pro: 'badge-warning',
};

const barColor: Record<string, string> = {
    free: 'bg-slate-400',
    basic: 'bg-blue-500',
    pro: 'bg-amber-500',
};

export default function SuperAdminDashboard({ stats, recentSchools }: Props) {
    const planTotal = Object.values(stats.plan_breakdown).reduce(
        (a, b) => a + b,
        0,
    );

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Super Admin Dashboard" />

            <div className="flex flex-col gap-6 p-6">
                {/* Page Title */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Platform Overview
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Monitor all schools and subscriptions across the
                        platform.
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Schools"
                        value={stats.total_schools}
                        icon={<School className="size-4 text-blue-500" />}
                        iconBg="bg-blue-500/10"
                        sub="Registered tenants"
                    />
                    <StatCard
                        title="Active Schools"
                        value={stats.active_schools}
                        icon={
                            <CheckCircle className="size-4 text-emerald-500" />
                        }
                        iconBg="bg-emerald-500/10"
                        sub="Currently active"
                    />
                    <StatCard
                        title="Suspended"
                        value={stats.suspended_schools}
                        icon={<ShieldAlert className="size-4 text-red-500" />}
                        iconBg="bg-red-500/10"
                        sub="Blocked accounts"
                    />
                    <StatCard
                        title="Total Users"
                        value={stats.total_users}
                        icon={<Users className="size-4 text-purple-500" />}
                        iconBg="bg-purple-500/10"
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
                        <CardContent className="space-y-4">
                            {['free', 'basic', 'pro'].map((plan) => {
                                const count = stats.plan_breakdown[plan] ?? 0;
                                const pct =
                                    planTotal > 0
                                        ? ((count / planTotal) * 100).toFixed(0)
                                        : '0';

                                return (
                                    <div
                                        key={plan}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="w-12 text-xs font-semibold capitalize">
                                            {plan}
                                        </span>
                                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={`h-full rounded-full ${barColor[plan]}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="w-16 text-right text-xs text-muted-foreground">
                                            {count} ({pct}%)
                                        </span>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Recent Schools */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="size-4" />
                                Recently Registered Schools
                            </CardTitle>
                            <Link
                                href="/super-admin/schools"
                                className="text-xs text-primary hover:underline"
                            >
                                View all schools →
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {recentSchools.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <School className="mb-3 size-10 text-muted-foreground/40" />
                                    <p className="font-medium text-muted-foreground">
                                        No schools registered yet
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Schools will appear here once they sign
                                        up.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    School
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Plan
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Joined
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentSchools.map((school) => (
                                                <tr
                                                    key={school.id}
                                                    className="border-b transition-colors last:border-0 hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">
                                                            {school.school_url ? (
                                                                <a
                                                                    href={
                                                                        school.school_url
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                                                >
                                                                    {
                                                                        school.name
                                                                    }
                                                                    <ExternalLink className="size-3" />
                                                                </a>
                                                            ) : (
                                                                school.name
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {
                                                                school.school_email
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`badge badge-sm capitalize ${planBadge[school.plan] ?? 'badge-ghost'}`}
                                                        >
                                                            {school.plan}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`badge badge-sm capitalize ${statusBadge[school.status] ?? 'badge-ghost'}`}
                                                        >
                                                            {school.status.replace(
                                                                /_/g,
                                                                ' ',
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                                        {new Date(
                                                            school.created_at,
                                                        ).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SuperAdminLayout>
    );
}

function StatCard({
    title,
    value,
    icon,
    iconBg,
    sub,
}: {
    title: string;
    value: number | undefined | null;
    icon: React.ReactNode;
    iconBg: string;
    sub?: string;
}) {
    const safeValue = value ?? 0;
    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={`rounded-md p-2 ${iconBg}`}>{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                    {safeValue.toLocaleString()}
                </div>
                {sub && (
                    <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                )}
            </CardContent>
        </Card>
    );
}
