import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Download, FileText, Filter } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Reports', href: '/admin/reports' },
];

interface Transaction {
    id: number;
    borrower: { name: string };
    equipment: { name: string };
    status: string;
    issued_at: string;
    returned_at: string | null;
    fine_amount: number;
}

interface Summary {
    total_transactions: number;
    returned: number;
    overdue: number;
    active: number;
}

interface Props {
    transactions: Transaction[];
    topEquipment: { equipment: { name: string }; total: number }[];
    topBorrowers: {
        borrower: { name: string; email: string };
        total: number;
    }[];
    summary: Summary;
    filters: { from: string; to: string };
    borrowData?: { month: string; borrowed: number; returned: number }[]; // Injected for chart
}

export default function ReportsIndex({
    transactions,
    topEquipment,
    topBorrowers,
    summary,
    filters,
    borrowData = [],
}: Props) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    function handleFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get('/admin/reports', { from, to }, { preserveState: true });
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Reports & Analytics"
                    description="Inventory and borrowing trends analysis."
                    actions={
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={`/admin/reports/export?type=excel&from=${from}&to=${to}`}
                                    className="gap-1.5"
                                >
                                    <Download className="size-3.5" /> Export
                                    Excel
                                </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={`/admin/reports/export?type=pdf&from=${from}&to=${to}`}
                                    className="gap-1.5"
                                >
                                    <FileText className="size-3.5" /> Export PDF
                                </a>
                            </Button>
                        </div>
                    }
                />

                {/* Filter */}
                <Card>
                    <CardHeader className="border-b pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Filter className="size-4" /> Date Range Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form
                            onSubmit={handleFilter}
                            className="flex flex-wrap items-end gap-4"
                        >
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="from"
                                    className="text-xs tracking-wider text-muted-foreground uppercase"
                                >
                                    From
                                </Label>
                                <Input
                                    type="date"
                                    id="from"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="to"
                                    className="text-xs tracking-wider text-muted-foreground uppercase"
                                >
                                    To
                                </Label>
                                <Input
                                    type="date"
                                    id="to"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            <Button type="submit" size="sm">
                                Apply
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
                    <StatCard
                        title="Total Transactions"
                        value={summary.total_transactions}
                        delay={0}
                    />
                    <StatCard
                        title="Active Loans"
                        value={summary.active}
                        valueColor="var(--chart-2)"
                        delay={0.05}
                    />
                    <StatCard
                        title="Returned"
                        value={summary.returned}
                        valueColor="var(--primary)"
                        delay={0.1}
                    />
                    <StatCard
                        title="Overdue"
                        value={summary.overdue}
                        valueColor="var(--destructive)"
                        delay={0.15}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Borrow Activity Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">
                                Borrow Activity
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Monthly borrow and return volume
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    borrowed: {
                                        label: 'Borrowed',
                                        theme: {
                                            light: 'var(--chart-1)',
                                            dark: 'var(--chart-2)',
                                        },
                                    },
                                    returned: {
                                        label: 'Returned',
                                        theme: {
                                            light: 'var(--chart-3)',
                                            dark: 'var(--chart-4)',
                                        },
                                    },
                                }}
                                className="h-[280px] w-full"
                            >
                                <BarChart data={borrowData}>
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar
                                        dataKey="borrowed"
                                        fill="var(--color-borrowed)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="returned"
                                        fill="var(--color-returned)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Ranking Lists */}
                    <div className="space-y-4">
                        <Card className="overflow-hidden border-border/60">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">
                                    Most Borrowed Equipment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <DataTable
                                    columns={[
                                        {
                                            key: 'rank',
                                            label: '#',
                                            width: '15%',
                                            render: (_, i) => i + 1,
                                        },
                                        {
                                            key: 'equipment',
                                            label: 'Equipment',
                                            width: '60%',
                                            render: (row) => row.equipment.name,
                                        },
                                        {
                                            key: 'total',
                                            label: 'Times',
                                            width: '25%',
                                            align: 'right',
                                            render: (row) => row.total,
                                        },
                                    ]}
                                    data={topEquipment}
                                    keyExtractor={(_, i) => i}
                                    emptyMessage="No data available"
                                />
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-border/60">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">
                                    Most Active Borrowers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <DataTable
                                    columns={[
                                        {
                                            key: 'rank',
                                            label: '#',
                                            width: '15%',
                                            render: (_, i) => i + 1,
                                        },
                                        {
                                            key: 'borrower',
                                            label: 'Student',
                                            width: '60%',
                                            render: (row) => row.borrower.name,
                                        },
                                        {
                                            key: 'total',
                                            label: 'Times',
                                            width: '25%',
                                            align: 'right',
                                            render: (row) => row.total,
                                        },
                                    ]}
                                    data={topBorrowers}
                                    keyExtractor={(_, i) => i}
                                    emptyMessage="No data available"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Full Log */}
                <Card className="overflow-hidden border-border/60">
                    <CardHeader className="border-b pb-3">
                        <div className="flex items-center gap-2">
                            <FileText className="size-4 text-muted-foreground" />
                            <CardTitle className="text-sm font-semibold">
                                Detailed Transaction Log
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <DataTable
                            columns={[
                                {
                                    key: 'borrower',
                                    label: 'Borrower',
                                    width: '20%',
                                    render: (t) => t.borrower.name,
                                },
                                {
                                    key: 'equipment',
                                    label: 'Equipment',
                                    width: '25%',
                                    render: (t) => t.equipment.name,
                                },
                                {
                                    key: 'issued',
                                    label: 'Issued',
                                    width: '15%',
                                    render: (t) => t.issued_at,
                                },
                                {
                                    key: 'returned',
                                    label: 'Returned',
                                    width: '15%',
                                    render: (t) => t.returned_at || '—',
                                },
                                {
                                    key: 'status',
                                    label: 'Status',
                                    width: '15%',
                                    align: 'center',
                                    render: (t) => (
                                        <StatusBadge status={t.status} />
                                    ),
                                },
                                {
                                    key: 'fine',
                                    label: 'Fine',
                                    width: '10%',
                                    align: 'right',
                                    render: (t) =>
                                        t.fine_amount > 0
                                            ? `₱${t.fine_amount}`
                                            : '—',
                                },
                            ]}
                            data={transactions}
                            keyExtractor={(t) => t.id}
                            emptyMessage="No transactions in this period"
                        />
                    </CardContent>
                </Card>
            </motion.div>
        </AdminLayout>
    );
}
