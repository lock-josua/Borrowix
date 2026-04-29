import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
    Activity,
    BarChart3,
    CheckCircle,
    CreditCard,
    ExternalLink,
    School,
    ShieldAlert,
    ShieldCheck,
    UserPlus,
    XCircle,
} from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
];

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
    tenant_id: string;
    tenant_name: string;
    actor: string;
    created_at: string;
    time_ago: string;
}

interface Props {
    stats: Stats;
    recentSchools: RecentSchool[];
    activityLog: ActivityLog[];
}

const eventIcons: Record<string, React.ReactNode> = {
    school_registered: <UserPlus className="size-4 text-green-500" />,
    school_created: <UserPlus className="size-4 text-green-500" />,
    school_updated: <Activity className="size-4 text-blue-500" />,
    school_suspended: <XCircle className="size-4 text-red-500" />,
    school_reactivated: <ShieldCheck className="size-4 text-green-500" />,
    credentials_resent: <ExternalLink className="size-4 text-orange-500" />,
    subscription_updated: <CreditCard className="size-4 text-purple-500" />,
};

const getEventIcon = (eventType: string) => {
    return (
        eventIcons[eventType] || (
            <Activity className="size-4 text-muted-foreground" />
        )
    );
};

const getEventCategory = (eventType: string): 'system' | 'subscription' => {
    const subscriptionEvents = [
        'subscription_activated',
        'subscription_updated',
        'trial_expired',
        'trial_warning_sent',
    ];
    return subscriptionEvents.includes(eventType) ? 'subscription' : 'system';
};

export default function SuperAdminDashboard({
    stats,
    recentSchools,
    activityLog,
}: Props) {
    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Platform Overview"
                    description="Manage all schools and platform activity."
                />

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatCard
                        title="Total Schools"
                        value={stats.total_schools}
                        delay={0}
                        icon={<School />}
                    />
                    <StatCard
                        title="Active"
                        value={stats.active_schools}
                        valueColor="hsl(var(--chart-2))"
                        delay={0.05}
                        icon={<CheckCircle />}
                    />
                    <StatCard
                        title="Suspended"
                        value={stats.suspended_schools}
                        valueColor="hsl(var(--destructive))"
                        delay={0.1}
                        icon={<ShieldAlert />}
                    />
                    <StatCard
                        title="Monthly Recurring Revenue"
                        value={`₱${stats.monthly_revenue.toLocaleString()}`}
                        valueColor="hsl(var(--chart-1))"
                        delay={0.15}
                        icon={<CreditCard />}
                    />
                </div>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <BarChart3 className="size-4" /> Plan Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(stats.plan_breakdown).map(
                                ([plan, count]) => (
                                    <div
                                        key={plan}
                                        className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2"
                                    >
                                        <span className="text-xs font-medium text-muted-foreground capitalize">
                                            {plan}
                                        </span>
                                        <span className="text-sm font-semibold">
                                            {count}
                                        </span>
                                    </div>
                                ),
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-border/60 p-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border px-4 py-3">
                        <CardTitle className="text-sm">
                            Recent Schools
                        </CardTitle>
                        <Link
                            href="/super-admin/schools"
                            className="text-xs text-primary hover:underline"
                        >
                            View all
                        </Link>
                    </CardHeader>
                    <DataTable
                        columns={[
                            {
                                key: 'name',
                                label: 'School',
                                width: '25%',
                                render: (s) => (
                                    <span className="block truncate font-medium">
                                        {s.name}
                                    </span>
                                ),
                            },
                            {
                                key: 'email',
                                label: 'Email',
                                width: '30%',
                                render: (s) => (
                                    <span className="block truncate text-xs text-muted-foreground">
                                        {s.school_email}
                                    </span>
                                ),
                            },
                            {
                                key: 'plan',
                                label: 'Plan',
                                width: '10%',
                                align: 'center',
                                render: (s) => <StatusBadge status={s.plan} />,
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                width: '10%',
                                align: 'center',
                                render: (s) => (
                                    <StatusBadge status={s.status} />
                                ),
                            },
                            {
                                key: 'created',
                                label: 'Joined',
                                width: '20%',
                                render: (s) => (
                                    <span className="text-xs text-muted-foreground">
                                        {format(
                                            new Date(s.created_at),
                                            'MMM d, yyyy',
                                        )}
                                    </span>
                                ),
                            },
                            {
                                key: 'actions',
                                label: '',
                                width: '5%',
                                align: 'right',
                                render: (s) => (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7"
                                        asChild
                                    >
                                        <Link
                                            href={`/super-admin/schools/${s.id}`}
                                        >
                                            <ExternalLink className="size-3.5" />
                                        </Link>
                                    </Button>
                                ),
                            },
                        ]}
                        data={recentSchools}
                        keyExtractor={(s) => s.id}
                        emptyMessage="No recent schools found"
                    />
                </Card>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* System Activity */}
                    <Card className="overflow-hidden border-border/60 p-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border px-4 py-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Activity className="size-4" /> System Activity
                            </CardTitle>
                        </CardHeader>
                        <div className="divide-y divide-border">
                            {activityLog &&
                            activityLog.filter(
                                (l) =>
                                    getEventCategory(l.event_type) === 'system',
                            ).length > 0 ? (
                                activityLog
                                    .filter(
                                        (l) =>
                                            getEventCategory(l.event_type) ===
                                            'system',
                                    )
                                    .slice(0, 8)
                                    .map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="mt-0.5">
                                                {getEventIcon(log.event_type)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm text-foreground">
                                                    {log.description}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">
                                                        {log.tenant_name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        •
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {log.time_ago}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                    <Activity className="mb-2 size-8 opacity-20" />
                                    <p className="text-sm">
                                        No system activity yet
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Subscription Logs */}
                    <Card className="overflow-hidden border-border/60 p-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border px-4 py-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <CreditCard className="size-4" /> Subscription
                                Logs
                            </CardTitle>
                        </CardHeader>
                        <div className="divide-y divide-border">
                            {activityLog &&
                            activityLog.filter(
                                (l) =>
                                    getEventCategory(l.event_type) ===
                                    'subscription',
                            ).length > 0 ? (
                                activityLog
                                    .filter(
                                        (l) =>
                                            getEventCategory(l.event_type) ===
                                            'subscription',
                                    )
                                    .slice(0, 8)
                                    .map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="mt-0.5">
                                                {getEventIcon(log.event_type)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm text-foreground">
                                                    {log.description}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">
                                                        {log.tenant_name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        •
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {log.time_ago}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                    <CreditCard className="mb-2 size-8 opacity-20" />
                                    <p className="text-sm">
                                        No subscription logs yet
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </motion.div>
        </SuperAdminLayout>
    );
}
