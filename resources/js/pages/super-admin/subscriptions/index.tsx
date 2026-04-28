import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    plan: string | null;
    status: string;
    trial_ends_at: string | null;
    trial_days_remaining: number;
    current_period_end: string | null;
    created_at: string;
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
    filters: { search?: string; status?: string; plan?: string };
    statusBreakdown: Record<string, number>;
}

export default function SubscriptionsIndex({
    subscriptions,
    filters,
    statusBreakdown,
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

    const columns = [
        {
            key: 'school',
            label: 'School',
            render: (row: Subscription) => (
                <div>
                    <p className="font-medium">{row.school.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {row.school.email}
                    </p>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row: Subscription) => <StatusBadge status={row.status} />,
        },
        {
            key: 'plan',
            label: 'Plan',
            render: (row: Subscription) => (
                <span className="capitalize">{row.plan ?? '—'}</span>
            ),
        },
        {
            key: 'trial_ends_at',
            label: 'Trial / Period End',
            render: (row: Subscription) => (
                <span className="text-sm text-muted-foreground">
                    {row.status === 'trialing' && row.trial_ends_at
                        ? new Date(row.trial_ends_at).toLocaleDateString()
                        : row.current_period_end
                          ? new Date(
                                row.current_period_end,
                            ).toLocaleDateString()
                          : '—'}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: 'Created',
            render: (row: Subscription) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: 'actions',
            label: '',
            align: 'right' as const,
            render: (row: Subscription) => (
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/super-admin/subscriptions/${row.school.id}`}>
                        <Eye className="size-4" />
                    </Link>
                </Button>
            ),
        },
    ];

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscriptions" />

            <div className="flex flex-col gap-6 p-6">
                <PageHeader
                    title="Subscriptions"
                    description="Monitor platform revenue and school subscriptions."
                />

                {/* Status Breakdown */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatCard
                        title="Trialing"
                        value={statusBreakdown.trialing ?? 0}
                        delay={0}
                    />
                    <StatCard
                        title="Subscribed"
                        value={statusBreakdown.subscribed ?? 0}
                        valueColor="hsl(var(--chart-2))"
                        delay={0.05}
                    />
                    <StatCard
                        title="Trial Expired"
                        value={statusBreakdown.trial_expired ?? 0}
                        valueColor="hsl(var(--destructive))"
                        delay={0.1}
                    />
                    <StatCard
                        title="Suspended"
                        value={statusBreakdown.suspended ?? 0}
                        valueColor="hsl(var(--destructive))"
                        delay={0.15}
                    />
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="flex flex-col gap-4 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <form
                                onSubmit={handleSearch}
                                className="flex flex-1 gap-2"
                            >
                                <Input
                                    placeholder="Search schools..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" variant="secondary">
                                    <Search className="size-4" />
                                </Button>
                            </form>
                            <Select
                                value={filters.status ?? 'all'}
                                onValueChange={(v) =>
                                    handleFilterChange('status', v)
                                }
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="trialing">
                                        Trialing
                                    </SelectItem>
                                    <SelectItem value="subscribed">
                                        Subscribed
                                    </SelectItem>
                                    <SelectItem value="trial_expired">
                                        Trial Expired
                                    </SelectItem>
                                    <SelectItem value="suspended">
                                        Suspended
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.plan ?? 'all'}
                                onValueChange={(v) =>
                                    handleFilterChange('plan', v)
                                }
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Plans
                                    </SelectItem>
                                    <SelectItem value="monthly">
                                        Monthly
                                    </SelectItem>
                                    <SelectItem value="annually">
                                        Annually
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card className="overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={subscriptions.data}
                        emptyMessage="No subscriptions found."
                        keyExtractor={(row) => row.id}
                    />
                    <TablePagination
                        currentPage={subscriptions.current_page}
                        lastPage={subscriptions.last_page}
                        nextUrl={subscriptions.next_page_url}
                        prevUrl={subscriptions.prev_page_url}
                    />
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
