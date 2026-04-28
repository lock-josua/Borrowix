import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CreditCard, School, TrendingUp } from 'lucide-react';
import * as React from 'react';
import {
    Area,
    AreaChart,
    Cell,
    Pie,
    PieChart,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import type {
    ChartConfig} from '@/components/ui/chart';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from '@/components/ui/chart';
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
    { title: 'Analytics', href: '/super-admin/analytics' },
];

interface GrowthData {
    date: string;
    annual: number;
    monthly: number;
}

interface Props {
    schoolsGrowth: GrowthData[];
    totals: { schools: number };
    subscriptionStats: Record<string, number>;
    revenue: {
        monthly_recurring: number; // MRR
        annual_recurring: number;  // ARR
        monthly_cash_flow: number;
        total: number;
    };
}

export default function Analytics({
    schoolsGrowth,
    totals,
    subscriptionStats,
    revenue,
}: Props) {
    const [timeRange, setTimeRange] = React.useState('90d');

    const revenueData = [
        { month: 'This Month', revenue: revenue.monthly_recurring },
        { month: 'This Year', revenue: revenue.annual_recurring },
    ];

    const filteredSchoolsGrowth = React.useMemo(() => {
        const referenceDate = new Date();
        let daysToSubtract = 90;
        if (timeRange === '30d') {
            daysToSubtract = 30;
        } else if (timeRange === '7d') {
            daysToSubtract = 7;
        }

        const startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - daysToSubtract);

        return schoolsGrowth.filter((item) => new Date(item.date) >= startDate);
    }, [schoolsGrowth, timeRange]);

    const chartConfig = {
        growth: {
            label: 'Growth',
        },
        annual: {
            label: 'Annual Plan',
            color: 'var(--chart-1)',
        },
        monthly: {
            label: 'Monthly Plan',
            color: 'var(--chart-2)',
        },
    } satisfies ChartConfig;

    const pieData = Object.entries(subscriptionStats).map(([name, value]) => ({
        name,
        value,
    }));

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Platform Analytics"
                    description="Usage and revenue metrics."
                />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
                    <StatCard
                        title="Total Schools"
                        value={totals.schools}
                        delay={0}
                        icon={<School />}
                    />
                    <StatCard
                        title="Monthly Recurring Revenue"
                        value={`₱${revenue.monthly_recurring.toLocaleString()}`}
                        valueColor="hsl(var(--chart-1))"
                        delay={0.05}
                        icon={<CreditCard />}
                    />
                    <StatCard
                        title="Annual Recurring Revenue"
                        value={`₱${revenue.annual_recurring.toLocaleString()}`}
                        valueColor="hsl(var(--chart-2))"
                        delay={0.1}
                        icon={<TrendingUp />}
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`₱${revenue.total.toLocaleString()}`}
                        valueColor="hsl(var(--chart-3))"
                        delay={0.15}
                        icon={<CreditCard />}
                    />
                </div>

                {/* Subscription Status Distribution */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Subscription Status
                            </CardTitle>
                            <CardDescription>
                                Current subscription distribution
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <StatusBadge status="trialing" />
                                <span className="text-xl font-bold">
                                    {subscriptionStats.trialing ?? 0}
                                </span>
                                <StatusBadge status="subscribed" />
                                <span className="text-xl font-bold">
                                    {subscriptionStats.subscribed ?? 0}
                                </span>
                                <StatusBadge status="trial_expired" />
                                <span className="text-xl font-bold">
                                    {subscriptionStats.trial_expired ?? 0}
                                </span>
                                <StatusBadge status="suspended" />
                                <span className="text-xl font-bold">
                                    {subscriptionStats.suspended ?? 0}
                                </span>
                            </div>
                            {pieData.length > 0 && (
                                <ChartContainer
                                    config={{}}
                                    className="mt-4 h-[200px]"
                                >
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={
                                                        [
                                                            '#f59e0b',
                                                            '#22c55e',
                                                            '#ef4444',
                                                            '#6b7280',
                                                        ][index % 4]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                        />
                                    </PieChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Revenue Trend
                            </CardTitle>
                            <CardDescription>Revenue over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{}} className="h-[200px]">
                                <AreaChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="hsl(var(--chart-1))"
                                        fill="hsl(var(--chart-1))"
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Schools Growth */}
                <Card>
                    <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                        <div className="grid flex-1 gap-1 text-center sm:text-left">
                            <CardTitle className="text-base">
                                Schools Growth
                            </CardTitle>
                            <CardDescription>
                                Showing new schools by plan type
                            </CardDescription>
                        </div>
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger
                                className="w-[160px] rounded-lg sm:ml-auto"
                                aria-label="Select a value"
                            >
                                <SelectValue placeholder="Last 3 months" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="90d" className="rounded-lg">
                                    Last 3 months
                                </SelectItem>
                                <SelectItem value="30d" className="rounded-lg">
                                    Last 30 days
                                </SelectItem>
                                <SelectItem value="7d" className="rounded-lg">
                                    Last 7 days
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                        <ChartContainer
                            config={chartConfig}
                            className="aspect-auto h-[350px] w-full"
                        >
                            <AreaChart data={filteredSchoolsGrowth}>
                                <defs>
                                    <linearGradient
                                        id="fillAnnual"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-annual)"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-annual)"
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                    <linearGradient
                                        id="fillMonthly"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-monthly)"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-monthly)"
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        return date.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        });
                                    }}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(value) => {
                                                return new Date(
                                                    value,
                                                ).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    year: 'numeric',
                                                });
                                            }}
                                            indicator="dot"
                                        />
                                    }
                                />
                                <Area
                                    dataKey="monthly"
                                    type="natural"
                                    fill="url(#fillMonthly)"
                                    stroke="var(--color-monthly)"
                                    stackId="a"
                                />
                                <Area
                                    dataKey="annual"
                                    type="natural"
                                    fill="url(#fillAnnual)"
                                    stroke="var(--color-annual)"
                                    stackId="a"
                                />
                                <ChartLegend
                                    content={<ChartLegendContent />}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </motion.div>
        </SuperAdminLayout>
    );
}
