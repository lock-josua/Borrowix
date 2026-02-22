import { Head, Link } from '@inertiajs/react';
import { Package, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StaffLayout from '@/layouts/StaffLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/staff/dashboard' }];

interface Transaction {
    id: number;
    borrower: { name: string };
    equipment: { name: string };
    due_date: string;
    status: string;
}

interface Props {
    stats: { available_equipment: number; active_loans: number; overdue_loans: number };
    urgentTransactions: Transaction[];
}

export default function StaffDashboard({ stats, urgentTransactions }: Props) {
    return (
        <StaffLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard title="Available Equipment" value={stats.available_equipment} icon={<Package className="size-5 text-primary" />} />
                    <StatCard title="Active Loans" value={stats.active_loans} icon={<ArrowLeftRight className="size-5 text-info" />} />
                    <StatCard title="Overdue" value={stats.overdue_loans} icon={<AlertTriangle className="size-5 text-error" />} />
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base text-destructive">Due / Overdue Items</CardTitle>
                        <Link href="/staff/transactions"><Button variant="ghost" size="sm">View all</Button></Link>
                    </CardHeader>
                    <CardContent>
                        {urgentTransactions.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">No urgent items. 🎉</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table table-sm w-full">
                                    <thead><tr className="text-muted-foreground"><th>Borrower</th><th>Equipment</th><th>Due</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {urgentTransactions.map((t) => (
                                            <tr key={t.id} className="hover">
                                                <td>{t.borrower.name}</td>
                                                <td>{t.equipment.name}</td>
                                                <td className="text-xs text-destructive">{new Date(t.due_date).toLocaleString()}</td>
                                                <td>
                                                    <Link href={`/staff/transactions/${t.id}`}>
                                                        <Button size="sm" variant="outline">Return</Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StaffLayout>
    );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent><div className="text-3xl font-bold">{value}</div></CardContent>
        </Card>
    );
}