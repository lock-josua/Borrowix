import { Head, Link } from '@inertiajs/react';
import {
    School,
    ShieldAlert,
    CheckCircle,
    TrendingUp,
    BarChart3,
    CreditCard,
    Sparkles,
    UserCheck,
    Tag,
    XCircle,
    AlertTriangle,
    Info,
    ExternalLink,
    ArrowRight,
} from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
];

// ─── Interfaces ───────────────────────────────────────────────

interface Stats {
    total_schools: number;
    active_schools: number;
    suspended_schools: number;
    new_this_month: number;
    monthly_revenue: number;
    plan_breakdown: Record<string, number>;
}

interface RecentSchool {
    id: string;
    name: string;
    school_email: string;
    plan: string;
    status: string;
    subdomain: string | null;
    school_url: string | null;
    created_at: string;
}

interface ActivityLog {
    id: number;
    event_type: string;
    description: string;
    tenant_id: string | null;
    tenant_name: string | null;
    actor: string;
    time_ago: string;
}

interface Alert {
    type: 'error' | 'warning' | 'info';
    title: string;
    description: string;
    action_url: string;
    action_label: string;
}

interface RevenueSnapshot {
    monthly_recurring: number;
    annual_recurring: number;
}

interface MonthlyData {
    month: string;
    total: number;
}

interface Props {
    stats: Stats;
    revenueSnapshot: RevenueSnapshot;
    recentSchools: RecentSchool[];
    schoolsGrowth: MonthlyData[];
    activityLog: ActivityLog[];
    alerts: Alert[];
}

// ─── Color maps ────────────────────────────────────────────────

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

const planBarColor: Record<string, string> = {
    free: 'bg-slate-400',
    basic: 'bg-blue-500',
    pro: 'bg-amber-500',
};

const growthChartConfig = {
    total: { label: 'New Schools', color: 'var(--chart-1)' },
} satisfies ChartConfig;

// ─── Event type → icon + color ─────────────────────────────────

function EventIcon({ type }: { type: string }) {
    const map: Record<string, { icon: React.ReactNode; color: string }> = {
        school_registered: {
            icon: <School className="size-3.5" />,
            color: 'bg-emerald-500/15 text-emerald-500',
        },
        school_suspended: {
            icon: <ShieldAlert className="size-3.5" />,
            color: 'bg-red-500/15 text-red-500',
        },
        school_reactivated: {
            icon: <CheckCircle className="size-3.5" />,
            color: 'bg-emerald-500/15 text-emerald-500',
        },
        subscription_upgraded: {
            icon: <TrendingUp className="size-3.5" />,
            color: 'bg-blue-500/15 text-blue-500',
        },
        subscription_canceled: {
            icon: <XCircle className="size-3.5" />,
            color: 'bg-red-500/15 text-red-500',
        },
        promo_created: {
            icon: <Tag className="size-3.5" />,
            color: 'bg-blue-500/15 text-blue-500',
        },
        promo_deleted: {
            icon: <Tag className="size-3.5" />,
            color: 'bg-slate-500/15 text-slate-500',
        },
    };
    const entry = map[type] ?? {
        icon: <Info className="size-3.5" />,
        color: 'bg-slate-500/15 text-slate-500',
    };
    return (
        <div
            className={`flex size-6 shrink-0 items-center justify-center rounded-full ${entry.color}`}
        >
            {entry.icon}
        </div>
    );
}

// ─── Alert border color ────────────────────────────────────────

const alertBorder: Record<string, string> = {
    error: 'border-l-red-500 bg-red-500/5',
    warning: 'border-l-amber-500 bg-amber-500/5',
    info: 'border-l-blue-500 bg-blue-500/5',
};

const alertIcon: Record<string, React.ReactNode> = {
    error: <AlertTriangle className="size-4 text-red-500" />,
    warning: <AlertTriangle className="size-4 text-amber-500" />,
    info: <Info className="size-4 text-blue-500" />,
};

// ─── Main component ────────────────────────────────────────────

export default function SuperAdminDashboard({
    stats,
    revenueSnapshot,
    recentSchools,
    schoolsGrowth,
    activityLog,
    alerts,
}: Props) {
    const totalForPlan = stats.total_schools > 0 ? stats.total_schools : 1;

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Platform Overview
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Monitor all schools and subscriptions across the
                        platform.
                    </p>
                </div>

                {/* ── Row 1: Stat Cards (5 cards) ── */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    <StatCard
                        title="Total Schools"
                        value={stats.total_schools}
                        sub="Registered tenants"
                        iconBg="bg-blue-500/10"
                        icon={<School className="size-4 text-blue-500" />}
                    />
                    <StatCard
                        title="Active Schools"
                        value={stats.active_schools}
                        sub="Currently active"
                        iconBg="bg-emerald-500/10"
                        icon={
                            <CheckCircle className="size-4 text-emerald-500" />
                        }
                    />
                    <StatCard
                        title="Suspended"
                        value={stats.suspended_schools}
                        sub="Blocked accounts"
                        iconBg="bg-red-500/10"
                        icon={<ShieldAlert className="size-4 text-red-500" />}
                    />
                    <StatCard
                        title="Monthly Revenue"
                        value={`₱${stats.monthly_revenue.toLocaleString()}`}
                        sub="Active subscriptions"
                        iconBg="bg-violet-500/10"
                        icon={<CreditCard className="size-4 text-violet-500" />}
                        isString
                    />
                    <StatCard
                        title="New This Month"
                        value={stats.new_this_month}
                        sub={`in ${new Date().toLocaleString('default', { month: 'long' })}`}
                        iconBg="bg-amber-500/10"
                        icon={<Sparkles className="size-4 text-amber-500" />}
                    />
                </div>

                {/* ── Row 2: Plan Breakdown + Revenue + Recent Schools ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
                    {/* Left column: Plan Breakdown + Revenue Snapshot */}
                    <div className="flex flex-col gap-6">
                        {/* Plan Breakdown */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <BarChart3 className="size-4" />
                                    Plan Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {(['free', 'basic', 'pro'] as const).map(
                                    (plan) => {
                                        const count =
                                            stats.plan_breakdown[plan] ?? 0;
                                        const pct = Math.round(
                                            (count / totalForPlan) * 100,
                                        );
                                        return (
                                            <div
                                                key={plan}
                                                className="flex items-center gap-3"
                                            >
                                                <span className="w-10 text-xs font-semibold text-muted-foreground capitalize">
                                                    {plan}
                                                </span>
                                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${planBarColor[plan]}`}
                                                        style={{
                                                            width: `${pct}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="w-16 text-right text-xs text-muted-foreground">
                                                    {count} ({pct}%)
                                                </span>
                                            </div>
                                        );
                                    },
                                )}
                            </CardContent>
                        </Card>

                        {/* Revenue Snapshot */}
                        <Card className="flex flex-1 flex-col">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <CreditCard className="size-4" />
                                    Revenue Snapshot
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col justify-between space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        Monthly Recurring
                                    </span>
                                    <span className="text-sm font-semibold">
                                        ₱
                                        {revenueSnapshot.monthly_recurring.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        Annual Recurring
                                    </span>
                                    <span className="text-sm font-semibold">
                                        ₱
                                        {revenueSnapshot.annual_recurring.toLocaleString()}
                                    </span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            Projected Yearly
                                        </span>
                                        <span className="text-sm font-bold text-primary">
                                            ₱
                                            {(
                                                revenueSnapshot.monthly_recurring *
                                                    12 +
                                                revenueSnapshot.annual_recurring
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <Link href="/super-admin/analytics">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-1 w-full text-xs"
                                    >
                                        View full analytics →
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right column: Recently Registered Schools */}
                    <Card className="flex flex-col lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <TrendingUp className="size-4" />
                                Recently Registered Schools
                            </CardTitle>
                            <Link
                                href="/super-admin/schools"
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                                View all schools{' '}
                                <ArrowRight className="size-3" />
                            </Link>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            {recentSchools.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <School className="mb-2 size-8 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">
                                        No schools registered yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/30">
                                                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                                                    School
                                                </th>
                                                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                                                    Plan
                                                </th>
                                                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                                                    Status
                                                </th>
                                                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                                                    Joined
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentSchools.map((school) => (
                                                <tr
                                                    key={school.id}
                                                    className="border-b transition-colors last:border-0 hover:bg-muted/30"
                                                >
                                                    <td className="px-4 py-3">
                                                        <Link
                                                            href={`/super-admin/schools/${school.id}`}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {school.name}
                                                        </Link>
                                                        <div className="text-xs text-muted-foreground">
                                                            {
                                                                school.school_email
                                                            }
                                                        </div>
                                                        {school.school_url && (
                                                            <a
                                                                href={
                                                                    school.school_url
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                                                            >
                                                                <ExternalLink className="size-2.5" />{' '}
                                                                {
                                                                    school.subdomain
                                                                }
                                                                .localhost
                                                            </a>
                                                        )}
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
                                                            {school.status}
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

                {/* ── Row 3: Activity Log + Alerts ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* System Activity Log */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <UserCheck className="size-4" />
                                System Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {activityLog.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <UserCheck className="mb-2 size-8 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">
                                        No activity yet.
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Events like school registrations and
                                        suspensions will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="max-h-[25rem] divide-y overflow-y-auto">
                                    {activityLog.map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                                        >
                                            <EventIcon type={log.event_type} />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[13px] leading-snug">
                                                    {log.description}
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                    {log.actor === 'super_admin'
                                                        ? 'by Super Admin · '
                                                        : ''}
                                                    {log.time_ago}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Needs Attention / Alerts */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <AlertTriangle className="size-4" />
                                Needs Attention
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {alerts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <CheckCircle className="mb-2 size-8 text-emerald-500/50" />
                                    <p className="text-sm text-muted-foreground">
                                        All good!
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        No issues require your attention right
                                        now.
                                    </p>
                                </div>
                            ) : (
                                <div className="max-h-[32rem] space-y-3 overflow-y-auto">
                                    {alerts.map((alert, i) => (
                                        <div
                                            key={i}
                                            className={`rounded-md border-l-4 p-3 ${alertBorder[alert.type]}`}
                                        >
                                            <div className="flex items-start gap-2">
                                                {alertIcon[alert.type]}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[13px] leading-snug font-medium">
                                                        {alert.title}
                                                    </p>
                                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                        {alert.description}
                                                    </p>
                                                    <Link
                                                        href={alert.action_url}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-2 h-7 text-xs"
                                                        >
                                                            {alert.action_label}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Row 4: School Registrations Growth Chart ── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <TrendingUp className="size-4" />
                            School Registrations — Last 6 Months
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {schoolsGrowth.length === 0 ? (
                            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                                No registration data yet.
                            </div>
                        ) : (
                            <ChartContainer
                                config={growthChartConfig}
                                className="h-[200px] w-full"
                            >
                                <BarChart data={schoolsGrowth} barSize={32}>
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(v: string) =>
                                            v.slice(5)
                                        }
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tick={{ fontSize: 11 }}
                                        allowDecimals={false}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar
                                        dataKey="total"
                                        radius={[4, 4, 0, 0]}
                                        fill="var(--color-total)"
                                    />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}

// ─── StatCard ──────────────────────────────────────────────────

function StatCard({
    title,
    value,
    sub,
    icon,
    iconBg,
    isString = false,
}: {
    title: string;
    value: number | string;
    sub?: string;
    icon: React.ReactNode;
    iconBg: string;
    isString?: boolean;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div
                    className={`flex size-7 items-center justify-center rounded-md ${iconBg}`}
                >
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">
                    {isString ? value : (value as number).toLocaleString()}
                </div>
                {sub && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {sub}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
