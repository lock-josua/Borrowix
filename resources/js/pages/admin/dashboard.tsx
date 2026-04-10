import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeftRight,
    CheckCircle,
    ClipboardList,
    Package,
    RotateCcw,
    Users,
    XCircle,
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

interface ActivityLog {
    id: number;
    event_type: string;
    description: string;
    user_name: string;
    time_ago: string;
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
    recentActivity: ActivityLog[];
    chartData: {
        dailyTransactions: { date: string; count: number }[];
        topEquipment: { name: string; count: number }[];
    };
    school: { name: string; plan: string };
}

const CHART_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

const eventIcons: Record<string, React.ReactNode> = {
    borrow_request_created: <ClipboardList className="size-4 text-blue-500" />,
    borrow_request_approved: <CheckCircle className="size-4 text-green-500" />,
    borrow_request_rejected: <XCircle className="size-4 text-red-500" />,
    transaction_issued: <Package className="size-4 text-purple-500" />,
    transaction_returned: <RotateCcw className="size-4 text-orange-500" />,
};

const getEventIcon = (eventType: string) => {
    return (
        eventIcons[eventType] || (
            <ClipboardList className="size-4 text-muted-foreground" />
        )
    );
};

export default function AdminDashboard({
    stats,
    pendingRequests,
    overdueTransactions,
    recentActivity,
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

                {/* Recent Activity */}
                <Card className="overflow-hidden border-border/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border px-4 py-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <ClipboardList className="size-4" /> Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <div className="divide-y divide-border">
                        {recentActivity && recentActivity.length > 0 ? (
                            recentActivity.slice(0, 8).map((log) => (
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
                                                {log.user_name}
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
                                <ClipboardList className="mb-2 size-8 opacity-20" />
                                <p className="text-sm">No activity yet</p>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>
        </AdminLayout>
    );
}
