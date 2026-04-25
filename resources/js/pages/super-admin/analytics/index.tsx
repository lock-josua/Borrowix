import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CreditCard, School, TrendingUp } from 'lucide-react';
import { Area, AreaChart, Cell, Pie, PieChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
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

interface Props {
    schoolsGrowth: MonthlyData[];
    totals: { schools: number };
    subscriptionStats: Record<string, number>;
    statusBreakdown: Record<string, number>;
    revenue: { monthly_recurring: number; annual_recurring: number; total: number };
}

export default function Analytics({
    schoolsGrowth,
    totals,
    subscriptionStats,
    statusBreakdown,
    revenue,
}: Props) {
    const revenueData = [
        { month: 'This Month', revenue: revenue.monthly_recurring },
        { month: 'This Year', revenue: revenue.annual_recurring },
    ];

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
                <PageHeader title="Platform Analytics" description="Usage and revenue metrics." />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
                    <StatCard title="Total Schools" value={totals.schools} delay={0} icon={<School />} />
                    <StatCard
                        title="Monthly Revenue"
                        value={`₱${revenue.monthly_recurring.toLocaleString()}`}
                        valueColor="hsl(var(--chart-1))"
                        delay={0.05}
                        icon={<CreditCard />}
                    />
                    <StatCard
                        title="Annual Revenue"
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
                            <CardTitle className="text-base">Subscription Status</CardTitle>
                            <CardDescription>Current subscription distribution</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <StatusBadge status="trialing" />
                                <span className="text-xl font-bold">{subscriptionStats.trialing ?? 0}</span>
                                <StatusBadge status="subscribed" />
                                <span className="text-xl font-bold">{subscriptionStats.subscribed ?? 0}</span>
                                <StatusBadge status="trial_expired" />
                                <span className="text-xl font-bold">{subscriptionStats.trial_expired ?? 0}</span>
                                <StatusBadge status="suspended" />
                                <span className="text-xl font-bold">{subscriptionStats.suspended ?? 0}</span>
                            </div>
                            {pieData.length > 0 && (
                                <ChartContainer config={{}} className="mt-4 h-[200px]">
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
                                                <Cell key={entry.name} fill={['#f59e0b', '#22c55e', '#ef4444', '#6b7280'][index % 4]} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                    </PieChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Revenue Trend</CardTitle>
                            <CardDescription>Revenue over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{}} className="h-[200px]">
                                <AreaChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Schools Growth */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Schools Growth</CardTitle>
                        <CardDescription>New schools over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}} className="h-[200px]">
                            <AreaChart data={schoolsGrowth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area type="monotone" dataKey="total" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </motion.div>
        </SuperAdminLayout>
    );
}