import { Head, Link } from '@inertiajs/react';
import { ClipboardList, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/layouts/StudentLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/student/dashboard' }];

interface ActiveLoan { id: number; equipment: { name: string }; due_date: string; status: string; }
interface PendingRequest { id: number; equipment: { name: string }; borrow_date: string; }
interface Props {
    stats: { active_loans: number; pending_requests: number; overdue_loans: number };
    activeLoans: ActiveLoan[];
    pendingRequests: PendingRequest[];
}

export default function StudentDashboard({ stats, activeLoans, pendingRequests }: Props) {
    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">My Dashboard</h1>
                    <Link href="/student/borrow-requests/create">
                        <Button>+ New Request</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard title="Active Loans" value={stats.active_loans} icon={<ArrowLeftRight className="size-5 text-info" />} />
                    <StatCard title="Pending Requests" value={stats.pending_requests} icon={<ClipboardList className="size-5 text-warning" />} />
                    <StatCard title="Overdue" value={stats.overdue_loans} icon={<AlertTriangle className="size-5 text-error" />} />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Active Loans</CardTitle>
                            <Link href="/student/history"><Button variant="ghost" size="sm">View history</Button></Link>
                        </CardHeader>
                        <CardContent>
                            {activeLoans.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">No active loans.</p>
                            ) : (
                                <div className="space-y-3">
                                    {activeLoans.map((loan) => (
                                        <div key={loan.id} className={`rounded-lg border p-3 ${loan.status === 'overdue' ? 'border-destructive/30 bg-destructive/5' : ''}`}>
                                            <p className="font-medium">{loan.equipment.name}</p>
                                            <p className={`text-xs ${loan.status === 'overdue' ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                Due: {new Date(loan.due_date).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Pending Requests</CardTitle>
                            <Link href="/student/borrow-requests"><Button variant="ghost" size="sm">View all</Button></Link>
                        </CardHeader>
                        <CardContent>
                            {pendingRequests.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">No pending requests.</p>
                            ) : (
                                <div className="space-y-3">
                                    {pendingRequests.map((r) => (
                                        <div key={r.id} className="rounded-lg border p-3">
                                            <p className="font-medium">{r.equipment.name}</p>
                                            <p className="text-xs text-muted-foreground">Requested for: {new Date(r.borrow_date).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StudentLayout>
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