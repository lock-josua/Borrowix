import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeftRight, Package } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import StaffLayout from '@/layouts/StaffLayout';
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
}

export default function StaffDashboard({ stats, urgentTransactions }: Props) {
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
