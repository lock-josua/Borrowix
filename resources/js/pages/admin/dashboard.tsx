import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeftRight, ClipboardList, Package, Users } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/admin/dashboard' }];

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
    school: { name: string; plan: string };
}

export default function AdminDashboard({ stats, pendingRequests, overdueTransactions, school }: Props) {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader title={school.name} description="Equipment borrowing overview" actions={<StatusBadge status={school.plan} />} />

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
                    <StatCard title="Active Loans" value={stats.active_loans} sub="Currently out" icon={<ArrowLeftRight />} delay={0.1} />
                    <StatCard
                        title="Overdue"
                        value={stats.overdue_loans}
                        sub="Needs action"
                        valueColor="hsl(var(--destructive))"
                        trend="down"
                        icon={<AlertTriangle />}
                        delay={0.15}
                    />
                    <StatCard title="Total Users" value={stats.total_students + stats.total_staff} icon={<Users />} delay={0.2} />
                </div>

                {/* Bottom grid */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                    <Card className="lg:col-span-3 overflow-hidden border-border/60">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Pending Requests</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <DataTable
                                columns={[
                                    {
                                        key: 'requester',
                                        label: 'Requester',
                                        width: '35%',
                                        render: (r) => <span className="font-medium text-foreground truncate block">{r.requester.name}</span>,
                                    },
                                    {
                                        key: 'equipment',
                                        label: 'Equipment',
                                        width: '30%',
                                        render: (r) => <span className="text-muted-foreground truncate block">{r.equipment.name}</span>,
                                    },
                                    {
                                        key: 'date',
                                        label: 'Date',
                                        width: '20%',
                                        render: (r) => <span className="text-muted-foreground text-xs">{r.borrow_date}</span>,
                                    },
                                    {
                                        key: 'action',
                                        label: '',
                                        width: '15%',
                                        align: 'right',
                                        render: (r) => (
                                            <Link href={`/admin/requests/${r.id}`} className="text-xs text-primary hover:underline">
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

                    <Card className="lg:col-span-2 overflow-hidden border-border/60">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Overdue Loans</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <DataTable
                                columns={[
                                    {
                                        key: 'borrower',
                                        label: 'Borrower',
                                        width: '40%',
                                        render: (r) => <span className="font-medium text-foreground truncate block">{r.borrower.name}</span>,
                                    },
                                    {
                                        key: 'equipment',
                                        label: 'Equipment',
                                        width: '35%',
                                        render: (r) => <span className="text-muted-foreground truncate block">{r.equipment.name}</span>,
                                    },
                                    {
                                        key: 'due',
                                        label: 'Due',
                                        width: '25%',
                                        align: 'right',
                                        render: (r) => <span className="text-destructive text-xs font-medium">{r.due_date}</span>,
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
