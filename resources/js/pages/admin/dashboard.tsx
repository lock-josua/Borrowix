import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeftRight,
    ClipboardList,
    Package,
    Users,
} from 'lucide-react';
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
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
];

interface PendingRequest {
    id: number;
    requester: { name: string };
    equipment: { name: string };
    borrow_date: string;
    expected_return_date: string;
}

interface OverdueTransaction {
    id: number;
    borrower: { name: string };
    equipment: { name: string };
    due_date: string;
}

interface Stats {
    total_equipment: number;
    available_equipment: number;
    pending_requests: number;
    active_loans: number;
    overdue_loans: number;
    total_students: number;
    total_staff: number;
}

interface Props {
    stats: Stats;
    pendingRequests: PendingRequest[];
    overdueTransactions: OverdueTransaction[];
    chartData: {
        dailyTransactions: { date: string; count: number }[];
        topEquipment: { name: string; count: number }[];
    };
    school: { name: string; plan: string };
}

const CHART_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard({
    stats,
    pendingRequests,
    overdueTransactions,
    chartData,
    school,
}: Props) {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title={school.name}
                    description="Equipment borrowing overview"
                    actions={<StatusBadge status={school.plan} />}
                />

                {/* Stat grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <StatCard
                        title="Equipment"
                        value={stats.total_equipment}
                        sub={`${stats.available_equipment} available`}
                        icon={<Package />}
                        delay={0}
                    />
                    <StatCard
                        title="Pending"
                        value={stats.pending_requests}
                        sub="Awaiting approval"
                        valueColor="hsl(var(--chart-4))"
                        icon={<ClipboardList />}
                        delay={0.05}
                    />
                    <StatCard
                        title="Active Loans"
                        value={stats.active_loans}
                        sub="Currently out"
                        icon={<ArrowLeftRight />}
                        delay={0.1}
                    />
                    <StatCard
                        title="Overdue"
                        value={stats.overdue_loans}
                        sub="Needs action"
                        valueColor="hsl(var(--destructive))"
                        trend="down"
                        icon={<AlertTriangle />}
                        delay={0.15}
                    />
                    <StatCard
                        title="Total Users"
                        value={stats.total_students + stats.total_staff}
                        icon={<Users />}
                        delay={0.2}
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

                {/* Bottom grid */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                    <Card className="overflow-hidden border-border/60 lg:col-span-3">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">
                                Pending Requests
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <DataTable
                                columns={[
                                    {
                                        key: 'requester',
                                        label: 'Requester',
                                        width: '35%',
                                        render: (r) => (
                                            <span className="block truncate font-medium text-foreground">
                                                {r.requester.name}
                                            </span>
                                        ),
                                    },
                                    {
                                        key: 'equipment',
                                        label: 'Equipment',
                                        width: '30%',
                                        render: (r) => (
                                            <span className="block truncate text-muted-foreground">
                                                {r.equipment.name}
                                            </span>
                                        ),
                                    },
                                    {
                                        key: 'date',
                                        label: 'Date',
                                        width: '20%',
                                        render: (r) => (
                                            <span className="text-xs text-muted-foreground">
                                                {r.borrow_date}
                                            </span>
                                        ),
                                    },
                                    {
                                        key: 'action',
                                        label: '',
                                        width: '15%',
                                        align: 'right',
                                        render: (r) => (
                                            <Link
                                                href={`/admin/requests/${r.id}`}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                Review
                                            </Link>
                                        ),
                                    },
                                ]}
                                data={pendingRequests}
                                keyExtractor={(r) => r.id}
                                emptyMessage="No pending requests"
                            />
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-border/60 lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">
                                Overdue Loans
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <DataTable
                                columns={[
                                    {
                                        key: 'borrower',
                                        label: 'Borrower',
                                        width: '40%',
                                        render: (r) => (
                                            <span className="block truncate font-medium text-foreground">
                                                {r.borrower.name}
                                            </span>
                                        ),
                                    },
                                    {
                                        key: 'equipment',
                                        label: 'Equipment',
                                        width: '35%',
                                        render: (r) => (
                                            <span className="block truncate text-muted-foreground">
                                                {r.equipment.name}
                                            </span>
                                        ),
                                    },
                                    {
                                        key: 'due',
                                        label: 'Due',
                                        width: '25%',
                                        align: 'right',
                                        render: (r) => (
                                            <span className="text-xs font-medium text-destructive">
                                                {r.due_date}
                                            </span>
                                        ),
                                    },
                                ]}
                                data={overdueTransactions}
                                keyExtractor={(r) => r.id}
                                emptyMessage="No overdue loans"
                            />
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </AdminLayout>
    );
}
