import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeftRight, Package } from 'lucide-react';
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Cell,
} from 'recharts';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StaffLayout from '@/layouts/StaffLayout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/staff/dashboard' },
];

interface Transaction {
    id: number;
    borrower: { name: string };
    equipment: { name: string };
    due_date: string;
    status: string;
}

interface Props {
    stats: {
        available_equipment: number;
        active_loans: number;
        overdue_loans: number;
    };
    urgentTransactions: Transaction[];
    chartData: {
        dailyTransactions: { date: string; count: number }[];
        topEquipment: { name: string; count: number }[];
    };
}

const CHART_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function StaffDashboard({
    stats,
    urgentTransactions,
    chartData,
}: Props) {
    return (
        <StaffLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Staff Dashboard"
                    description="Process equipment returns and manage requests."
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <StatCard
                        title="Active Loans"
                        value={stats.active_loans}
                        delay={0}
                        icon={<ArrowLeftRight />}
                    />
                    <StatCard
                        title="Pending Requests"
                        value={0}
                        valueColor="hsl(var(--chart-4))"
                        delay={0.05}
                        icon={<Package />}
                    />
                    <StatCard
                        title="Overdue"
                        value={stats.overdue_loans}
                        valueColor="hsl(var(--destructive))"
                        trend="down"
                        delay={0.1}
                        icon={<AlertTriangle />}
                    />
                </div>

                {/* Charts section */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                    {/* Daily Transactions Chart */}
                    <Card className="overflow-hidden border-border/60 lg:col-span-3">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">
                                Daily Transactions (Last 30 Days)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {chartData.dailyTransactions.length > 0 ? (
                                <div className="h-[200px]">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={chartData.dailyTransactions}
                                        >
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 10 }}
                                                tickLine={false}
                                                axisLine={false}
                                                interval="preserveStartEnd"
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10 }}
                                                tickLine={false}
                                                axisLine={false}
                                                allowDecimals={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    fontSize: '12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e2e8f0',
                                                }}
                                            />
                                            <Bar
                                                dataKey="count"
                                                fill="#10b981"
                                                radius={[4, 4, 0, 0]}
                                                name="Transactions"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                                    No transaction data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Equipment Chart */}
                    <Card className="overflow-hidden border-border/60 lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">
                                Top Borrowed Equipment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {chartData.topEquipment.length > 0 ? (
                                <div className="h-[200px]">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={chartData.topEquipment}
                                            layout="vertical"
                                            margin={{ left: 0, right: 20 }}
                                        >
                                            <XAxis
                                                type="number"
                                                tick={{ fontSize: 10 }}
                                                tickLine={false}
                                                axisLine={false}
                                                allowDecimals={false}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                tick={{ fontSize: 10 }}
                                                tickLine={false}
                                                axisLine={false}
                                                width={80}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    fontSize: '12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e2e8f0',
                                                }}
                                            />
                                            <Bar
                                                dataKey="count"
                                                radius={[0, 4, 4, 0]}
                                                name="Count"
                                            >
                                                {chartData.topEquipment.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={
                                                                CHART_COLORS[
                                                                    index %
                                                                        CHART_COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                                    No equipment data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="overflow-hidden p-0">
                    <CardHeader className="border-b border-border px-4 py-3">
                        <CardTitle className="text-sm font-semibold">
                            Urgent: Due / Overdue Items
                        </CardTitle>
                    </CardHeader>
                    <DataTable
                        columns={[
                            {
                                key: 'borrower',
                                label: 'Borrower',
                                width: '35%',
                                render: (t) => (
                                    <span className="font-medium text-foreground">
                                        {t.borrower.name}
                                    </span>
                                ),
                            },
                            {
                                key: 'equipment',
                                label: 'Equipment',
                                width: '35%',
                                render: (t) => (
                                    <span className="text-muted-foreground">
                                        {t.equipment.name}
                                    </span>
                                ),
                            },
                            {
                                key: 'due',
                                label: 'Due Date',
                                width: '15%',
                                render: (t) => (
                                    <span className="text-xs font-medium text-destructive">
                                        {t.due_date}
                                    </span>
                                ),
                            },
                            {
                                key: 'action',
                                label: '',
                                width: '15%',
                                align: 'right',
                                render: (t) => (
                                    <Link
                                        href={`/staff/transactions/${t.id}`}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Return
                                    </Link>
                                ),
                            },
                        ]}
                        data={urgentTransactions}
                        keyExtractor={(t) => t.id}
                        emptyMessage="No urgent items to process"
                    />
                </Card>
            </motion.div>
        </StaffLayout>
    );
}
