import { Head } from '@inertiajs/react';
import { School, CreditCard, TrendingUp, Percent } from 'lucide-react';
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
    { title: 'Analytics', href: '/super-admin/analytics' },
];

interface MonthlyData {
    month: string;
    total: number;
}

interface DiscountStats {
    with_discount: number;
    total_active: number;
}

interface Revenue {
    monthly_recurring: number;
    annual_recurring: number;
    projected_yearly: number;
}

interface Totals {
    schools: number;
}

interface Props {
    schoolsGrowth: MonthlyData[];
    totals: Totals;
    planBreakdown: Record<string, number>;
    statusBreakdown: Record<string, number>;
    billingBreakdown: Record<string, number>;
    discountStats: DiscountStats;
    revenue: Revenue;
}

const schoolGrowthChartConfig = {
    total: { label: 'New Schools', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const planChartConfig = {
    free: { label: 'Free', color: 'var(--chart-3)' },
    basic: { label: 'Basic', color: 'var(--chart-2)' },
    pro: { label: 'Pro', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const statusChartConfig = {
    active: { label: 'Active', color: 'var(--chart-2)' },
    trialing: { label: 'Trialing', color: 'var(--chart-4)' },
    past_due: { label: 'Past Due', color: 'var(--chart-3)' },
    canceled: { label: 'Canceled', color: 'var(--chart-5)' },
    paused: { label: 'Paused', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const billingChartConfig = {
    monthly: { label: 'Monthly', color: 'var(--chart-1)' },
    annual: { label: 'Annual', color: 'var(--chart-2)' },
} satisfies ChartConfig;

export default function Analytics({
    schoolsGrowth,
    totals,
    planBreakdown,
    statusBreakdown,
    billingBreakdown,
    discountStats,
    revenue,
}: Props) {
    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">Platform Analytics</h1>
                    <p className="text-sm text-muted-foreground">
                        Platform-wide usage, subscriptions, and revenue metrics.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        label="Total Schools"
                        value={totals.schools}
                        icon={<School className="size-4 text-primary" />}
                    />
                    <StatCard
                        label="Monthly Revenue"
                        value={`₱${revenue.monthly_recurring.toLocaleString()}`}
                        icon={<CreditCard className="size-4 text-secondary" />}
                    />
                    <StatCard
                        label="Projected Yearly"
                        value={`₱${revenue.projected_yearly.toLocaleString()}`}
                        icon={<TrendingUp className="size-4 text-accent" />}
                    />
                    <StatCard
                        label="Discounts Active"
                        value={`${discountStats.with_discount} / ${discountStats.total_active}`}
                        icon={<Percent className="text-info size-4" />}
                    />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* School Growth */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                New Schools (Last 6 Months)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {schoolsGrowth.length === 0 ? (
                                <EmptyState />
                            ) : (
                                <ChartContainer
                                    config={schoolGrowthChartConfig}
                                    className="aspect-video h-[250px]"
                                >
                                    <BarChart data={schoolsGrowth}>
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(v: string) =>
                                                v.slice(5)
                                            }
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                        />
                                        <Bar
                                            dataKey="total"
                                            radius={[4, 4, 0, 0]}
                                            fill="var(--color-total)"
                                        />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Plan Distribution Pie */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Subscription Plans
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(planBreakdown).length === 0 ? (
                                <EmptyState />
                            ) : (
                                <ChartContainer
                                    config={planChartConfig}
                                    className="aspect-video h-[250px]"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    hideLabel
                                                />
                                            }
                                        />
                                        <Pie
                                            data={toPieData(planBreakdown)}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                        >
                                            {toPieData(planBreakdown).map(
                                                (entry) => (
                                                    <Cell
                                                        key={entry.name}
                                                        fill={`var(--color-${entry.name})`}
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Status Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Subscription Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(statusBreakdown).length === 0 ? (
                                <EmptyState />
                            ) : (
                                <ChartContainer
                                    config={statusChartConfig}
                                    className="aspect-video h-[250px]"
                                >
                                    <BarChart
                                        data={toBarData(statusBreakdown)}
                                        layout="vertical"
                                    >
                                        <XAxis
                                            type="number"
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            tickLine={false}
                                            axisLine={false}
                                            width={80}
                                            tickFormatter={(v: string) =>
                                                v.replace('_', ' ')
                                            }
                                        />
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                        />
                                        <Bar
                                            dataKey="value"
                                            radius={[0, 4, 4, 0]}
                                        >
                                            {toBarData(statusBreakdown).map(
                                                (entry) => (
                                                    <Cell
                                                        key={entry.name}
                                                        fill={`var(--color-${entry.name})`}
                                                    />
                                                ),
                                            )}
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Billing Cycle Pie */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Billing Cycle
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(billingBreakdown).length === 0 ? (
                                <EmptyState />
                            ) : (
                                <ChartContainer
                                    config={billingChartConfig}
                                    className="aspect-video h-[250px]"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    hideLabel
                                                />
                                            }
                                        />
                                        <Pie
                                            data={toPieData(billingBreakdown)}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                        >
                                            {toPieData(billingBreakdown).map(
                                                (entry) => (
                                                    <Cell
                                                        key={entry.name}
                                                        fill={`var(--color-${entry.name})`}
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Revenue Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <RevenueItem
                                label="Monthly Recurring"
                                value={revenue.monthly_recurring}
                            />
                            <RevenueItem
                                label="Annual Recurring"
                                value={revenue.annual_recurring}
                            />
                            <RevenueItem
                                label="Projected Yearly"
                                value={revenue.projected_yearly}
                                highlight
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-1">
                <CardTitle className="text-xs text-muted-foreground">
                    {label}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
            </CardContent>
        </Card>
    );
}

function RevenueItem({
    label,
    value,
    highlight = false,
}: {
    label: string;
    value: number;
    highlight?: boolean;
}) {
    return (
        <div
            className={`rounded-lg p-4 ${highlight ? 'border border-primary/20 bg-primary/5' : 'bg-muted/50'}`}
        >
            <p className="text-sm text-muted-foreground">{label}</p>
            <p
                className={`text-xl font-bold ${highlight ? 'text-primary' : ''}`}
            >
                ₱{value.toLocaleString()}
            </p>
        </div>
    );
}

function EmptyState() {
    return (
        <p className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            No data yet.
        </p>
    );
}

function toPieData(record: Record<string, number>) {
    return Object.entries(record).map(([name, value]) => ({ name, value }));
}

function toBarData(record: Record<string, number>) {
    return Object.entries(record).map(([name, value]) => ({ name, value }));
}
