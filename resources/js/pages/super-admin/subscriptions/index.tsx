import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    filters: { search?: string; plan?: string; status?: string };
}

export default function SubscriptionsIndex({
    subscriptions,
    breakdown,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(
            '/super-admin/subscriptions',
            { ...filters, search },
            { preserveState: true },
        );
    }

    function handleFilterChange(key: string, value: string) {
        router.get(
            '/super-admin/subscriptions',
            { ...filters, [key]: value === 'all' ? '' : value },
            { preserveState: true },
        );
    }

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

                <Card className="flex flex-row flex-wrap items-center gap-2 p-3 py-3">
                    <form
                        onSubmit={handleSearch}
                        className="relative max-w-xs min-w-[220px] flex-1"
                    >
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="h-9 bg-muted/20 pl-8 text-sm"
                            placeholder="Search school or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                    <Select
                        value={filters.plan ?? 'all'}
                        onValueChange={(v) => handleFilterChange('plan', v)}
                    >
                        <SelectTrigger className="h-9 w-[130px] bg-muted/20 text-sm">
                            <SelectValue placeholder="All Plans" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Plans</SelectItem>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.status ?? 'all'}
                        onValueChange={(v) => handleFilterChange('status', v)}
                    >
                        <SelectTrigger className="h-9 w-[130px] bg-muted/20 text-sm">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="canceled">Canceled</SelectItem>
                            <SelectItem value="past_due">Past Due</SelectItem>
                            <SelectItem value="trialing">Trialing</SelectItem>
                        </SelectContent>
                    </Select>
                </Card>

                <Card className="overflow-hidden border-border/60 p-0">
                    <DataTable
                        columns={[
                            {
                                key: 'school',
                                label: 'School',
                                width: '28%',
                                render: (s) => (
                                    <div>
                                        <p className="truncate font-medium text-foreground">
                                            {s.school.name}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {s.school.email}
                                        </p>
                                    </div>
                                ),
                            },
                            {
                                key: 'plan',
                                label: 'Plan',
                                width: '12%',
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
                                        {parseFloat(s.discount_amount) > 0
                                            ? `₱${parseFloat(s.discount_amount).toFixed(0)}`
                                            : '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'actions',
                                label: '',
                                width: '10%',
                                align: 'right',
                                render: (s) => (
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7"
                                            aria-label="View subscription"
                                            asChild
                                        >
                                            <Link
                                                href={`/super-admin/subscriptions/${s.school.id}`}
                                            >
                                                <Eye className="size-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
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
