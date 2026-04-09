import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CreditCard, Eye, TrendingUp } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
    { title: 'Subscriptions', href: '/super-admin/subscriptions' },
];

interface Subscription {
    id: number;
    plan: string;
    status: string;
    created_at: string;
    current_period_end: string | null;
    discount_amount: string;
    school: { id: string; name: string; email: string };
}

interface Props {
    subscriptions: {
        data: Subscription[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    breakdown: Record<string, number>;
}

export default function SubscriptionsIndex({
    subscriptions,
    breakdown,
}: Props) {
    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscriptions" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Subscriptions"
                    description="Monitor platform revenue and school plans."
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <StatCard
                        title="Free Plan"
                        value={breakdown.free ?? 0}
                        sub="schools"
                        delay={0}
                    />
                    <StatCard
                        title="Basic Plan"
                        value={breakdown.basic ?? 0}
                        sub="schools"
                        valueColor="hsl(var(--chart-2))"
                        delay={0.05}
                    />
                    <StatCard
                        title="Pro Plan"
                        value={breakdown.pro ?? 0}
                        sub="schools"
                        valueColor="hsl(var(--chart-1))"
                        delay={0.1}
                    />
                </div>

                <Card className="overflow-hidden p-0">
                    <DataTable
                        columns={[
                            {
                                key: 'school',
                                label: 'School',
                                width: '25%',
                                render: (s) => (
                                    <span className="block truncate font-medium">
                                        {s.school.name}
                                    </span>
                                ),
                            },
                            {
                                key: 'plan',
                                label: 'Plan',
                                width: '13%',
                                align: 'center',
                                render: (s) => <StatusBadge status={s.plan} />,
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                width: '12%',
                                align: 'center',
                                render: (s) => (
                                    <StatusBadge status={s.status} />
                                ),
                            },
                            {
                                key: 'started',
                                label: 'Started',
                                width: '13%',
                                render: (s) => (
                                    <span className="text-xs text-muted-foreground">
                                        {s.created_at}
                                    </span>
                                ),
                            },
                            {
                                key: 'expires',
                                label: 'Expires',
                                width: '13%',
                                render: (s) => (
                                    <span className="text-xs text-muted-foreground">
                                        {s.current_period_end || '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'amount',
                                label: 'Amount',
                                width: '12%',
                                align: 'right',
                                render: (s) => (
                                    <span className="font-medium">
                                        ₱
                                        {parseFloat(s.discount_amount) > 0
                                            ? 0
                                            : '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'actions',
                                label: '',
                                width: '12%',
                                align: 'right',
                                render: (s) => (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7"
                                        asChild
                                    >
                                        <Link
                                            href={`/super-admin/schools/${s.school.id}`}
                                        >
                                            <Eye className="size-3.5" />
                                        </Link>
                                    </Button>
                                ),
                            },
                        ]}
                        data={subscriptions.data}
                        keyExtractor={(s) => s.id}
                    />
                    <TablePagination
                        currentPage={subscriptions.current_page}
                        lastPage={subscriptions.last_page}
                        nextUrl={subscriptions.next_page_url}
                        prevUrl={subscriptions.prev_page_url}
                    />
                </Card>
            </motion.div>
        </SuperAdminLayout>
    );
}
