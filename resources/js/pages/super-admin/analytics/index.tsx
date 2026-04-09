import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CreditCard, Percent, School, TrendingUp } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
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

interface RevenueData {
    month: string;
    revenue: number;
}

interface Props {
    schoolsGrowth: MonthlyData[];
    revenueTrend?: RevenueData[]; // Injected for chart
    totals: { schools: number };
    planBreakdown: Record<string, number>;
    discountStats: { with_discount: number; total_active: number };
    revenue: { monthly_recurring: number; projected_yearly: number };
}

export default function Analytics({ schoolsGrowth, revenueTrend = [], totals, planBreakdown, discountStats, revenue }: Props) {
    const pieData = Object.entries(planBreakdown).map(([name, value]) => ({ name, value }));

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
                        title="Projected Yearly"
                        value={`₱${revenue.projected_yearly.toLocaleString()}`}
                        valueColor="hsl(var(--chart-2))"
                        delay={0.1}
                        icon={<TrendingUp />}
                    />
                    <StatCard
                        title="Discounts Active"
                        value={`${discountStats.with_discount} / ${discountStats.total_active}`}
                        sub="active schools"
                        delay={0.15}
                        icon={<Percent />}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Revenue trend — Area Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Revenue Over Time</CardTitle>
                            <CardDescription className="text-xs">Monthly subscription revenue trend</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{ revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' } }} className="h-[260px] w-full">
                                <AreaChart data={revenueTrend}>
                                    <defs>
                                        <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${v.toLocaleString()}`} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="var(--color-revenue)"
                                        fill="url(#fillRevenue)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Plan distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Plan Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    free: { label: 'Free', color: 'hsl(var(--chart-3))' },
                                    basic: { label: 'Basic', color: 'hsl(var(--chart-2))' },
                                    pro: { label: 'Pro', color: 'hsl(var(--chart-1))' },
                                }}
                                className="h-[220px] w-full"
                            >
                                <PieChart>
                                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={`var(--color-${entry.name})`} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* School growth */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">School Growth</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{ total: { label: 'New Schools', color: 'hsl(var(--chart-1))' } }} className="h-[220px] w-full">
                                <BarChart data={schoolsGrowth}>
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </SuperAdminLayout>
    );
}
