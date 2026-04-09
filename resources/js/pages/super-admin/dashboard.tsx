import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle, CreditCard, ExternalLink, School, ShieldAlert } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/super-admin/dashboard' }];

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

interface Props {
    stats: Stats;
    recentSchools: RecentSchool[];
}

export default function SuperAdminDashboard({ stats, recentSchools }: Props) {
    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader title="Platform Overview" description="Manage all schools and platform activity." />

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatCard title="Total Schools" value={stats.total_schools} delay={0} icon={<School />} />
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
                        title="Monthly Revenue"
                        value={`₱${stats.monthly_revenue.toLocaleString()}`}
                        valueColor="hsl(var(--chart-1))"
                        delay={0.15}
                        icon={<CreditCard />}
                    />
                </div>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <BarChart3 className="size-4" /> Plan Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3 flex-wrap">
                            {Object.entries(stats.plan_breakdown).map(([plan, count]) => (
                                <div key={plan} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                                    <span className="text-xs text-muted-foreground capitalize font-medium">{plan}</span>
                                    <span className="text-sm font-semibold">{count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="p-0 overflow-hidden border-border/60">
                    <CardHeader className="px-4 py-3 border-b border-border flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm">Recent Schools</CardTitle>
                        <Link href="/super-admin/schools" className="text-xs text-primary hover:underline">
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
                                render: (s) => <span className="block truncate text-xs text-muted-foreground">{s.school_email}</span>,
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
                                render: (s) => <StatusBadge status={s.status} />,
                            },
                            {
                                key: 'created',
                                label: 'Joined',
                                width: '20%',
                                render: (s) => (
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(s.created_at), 'MMM d, yyyy')}
                                    </span>
                                ),
                            },
                            {
                                key: 'actions',
                                label: '',
                                width: '5%',
                                align: 'right',
                                render: (s) => (
                                    <Button variant="ghost" size="icon" className="size-7" asChild>
                                        <Link href={`/super-admin/schools/${s.id}`}>
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
            </motion.div>
        </SuperAdminLayout>
    );
}
