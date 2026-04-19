import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ScanLine, Search } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import StudentLayout from '@/layouts/StudentLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/student/dashboard' },
];

interface ActiveLoan {
    id: number;
    equipment: { name: string };
    due_date: string;
    status: string;
}

interface PendingRequest {
    id: number;
    equipment: { name: string };
    borrow_date: string;
}

interface Props {
    stats: {
        active_loans: number;
        pending_requests: number;
        overdue_loans: number;
    };
    activeLoans: ActiveLoan[];
    pendingRequests: PendingRequest[];
}

export default function StudentDashboard({
    stats,
    activeLoans,
    pendingRequests,
}: Props) {
    const { auth } = usePage().props;
    const user = auth.user as { name: string };

    const hour = new Date().getHours();
    const greeting =
        hour < 12
            ? 'Good morning'
            : hour < 18
              ? 'Good afternoon'
              : 'Good evening';
    const firstName = user.name.split(' ')[0];

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title={`${greeting}, ${firstName}`}
                    description="Your borrowing activity at a glance."
                    actions={
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                                <Link href="/student/scan">
                                    <ScanLine className="mr-1.5 size-3.5" />
                                    Scan QR
                                </Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/student/browse">
                                    <Search className="mr-1.5 size-3.5" />
                                    Browse Equipment
                                </Link>
                            </Button>
                        </div>
                    }
                />

                <div className="grid grid-cols-3 gap-3">
                    <StatCard
                        title="Active Loans"
                        value={stats.active_loans}
                        delay={0}
                    />
                    <StatCard
                        title="Pending"
                        value={stats.pending_requests}
                        valueColor="hsl(var(--chart-4))"
                        delay={0.05}
                    />
                    <StatCard
                        title="Overdue"
                        value={stats.overdue_loans}
                        valueColor="hsl(var(--destructive))"
                        trend="down"
                        delay={0.1}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card className="overflow-hidden p-0">
                        <CardHeader className="border-b border-border px-4 py-3">
                            <CardTitle className="text-sm">
                                Active Loans
                            </CardTitle>
                        </CardHeader>
                        <DataTable
                            columns={[
                                {
                                    key: 'equipment',
                                    label: 'Equipment',
                                    width: '50%',
                                    render: (l) => (
                                        <span className="block truncate font-medium">
                                            {l.equipment.name}
                                        </span>
                                    ),
                                },
                                {
                                    key: 'due',
                                    label: 'Due Date',
                                    width: '30%',
                                    render: (l) => (
                                        <span className="text-xs text-muted-foreground">
                                            {l.due_date}
                                        </span>
                                    ),
                                },
                                {
                                    key: 'status',
                                    label: 'Status',
                                    width: '20%',
                                    align: 'center',
                                    render: (l) => (
                                        <StatusBadge status={l.status} />
                                    ),
                                },
                            ]}
                            data={activeLoans}
                            keyExtractor={(l) => l.id}
                            emptyMessage="No active loans"
                        />
                    </Card>

                    <Card className="overflow-hidden p-0">
                        <CardHeader className="border-b border-border px-4 py-3">
                            <CardTitle className="text-sm">
                                Pending Requests
                            </CardTitle>
                        </CardHeader>
                        <DataTable
                            columns={[
                                {
                                    key: 'equipment',
                                    label: 'Equipment',
                                    width: '55%',
                                    render: (r) => (
                                        <span className="block truncate font-medium">
                                            {r.equipment.name}
                                        </span>
                                    ),
                                },
                                {
                                    key: 'date',
                                    label: 'Borrow Date',
                                    width: '45%',
                                    render: (r) => (
                                        <span className="text-xs text-muted-foreground">
                                            {r.borrow_date}
                                        </span>
                                    ),
                                },
                            ]}
                            data={pendingRequests}
                            keyExtractor={(r) => r.id}
                            emptyMessage="No pending requests"
                        />
                    </Card>
                </div>
            </motion.div>
        </StudentLayout>
    );
}
