import { Head, Link, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    ArrowLeftRight,
    AlertTriangle,
    Search,
    CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

            <div className="flex flex-col gap-5 p-4 lg:p-6">
                {/* Greeting */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">
                            {greeting}, {firstName} 👋
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Track your loans and requests.
                        </p>
                    </div>
                </div>

                {/* Stat cards — always 3 columns even on phone */}
                <div className="grid grid-cols-3 gap-2.5">
                    <StatCard
                        title="Active"
                        value={stats.active_loans}
                        icon={
                            <ArrowLeftRight className="size-4 text-cyan-500" />
                        }
                        iconBg="bg-cyan-500/10"
                    />
                    <StatCard
                        title="Pending"
                        value={stats.pending_requests}
                        icon={
                            <ClipboardList className="size-4 text-amber-500" />
                        }
                        iconBg="bg-amber-500/10"
                    />
                    <StatCard
                        title="Overdue"
                        value={stats.overdue_loans}
                        icon={<AlertTriangle className="size-4 text-red-500" />}
                        iconBg="bg-red-500/10"
                    />
                </div>

                {/* Browse CTA — only show on mobile/tablet */}
                <Link href="/student/browse" className="block lg:hidden">
                    <div className="flex items-center gap-3 rounded-xl border bg-primary/5 p-4 transition-colors hover:bg-primary/10">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                            <Search className="size-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                Browse equipment
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Find and borrow available equipment
                            </p>
                        </div>
                        <span className="ml-auto text-muted-foreground">→</span>
                    </div>
                </Link>

                {/* Active Loans */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pt-4 pb-3">
                        <CardTitle className="text-sm font-medium">
                            Active Loans
                        </CardTitle>
                        <Link href="/student/history">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                            >
                                View history
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {activeLoans.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <CheckCircle className="mb-2 size-7 text-emerald-500/40" />
                                <p className="text-sm text-muted-foreground">
                                    No active loans
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    You have no equipment currently borrowed.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {activeLoans.map((loan) => (
                                    <div
                                        key={loan.id}
                                        className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${
                                            loan.status === 'overdue'
                                                ? 'border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20'
                                                : ''
                                        }`}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {loan.equipment.name}
                                            </p>
                                            <p
                                                className={`mt-0.5 flex items-center gap-1 text-xs ${
                                                    loan.status === 'overdue'
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : 'text-muted-foreground'
                                                }`}
                                            >
                                                {loan.status === 'overdue' && (
                                                    <AlertTriangle className="size-3 shrink-0" />
                                                )}
                                                Due{' '}
                                                {new Date(
                                                    loan.due_date,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {loan.status === 'overdue' && (
                                            <span className="badge badge-sm badge-error shrink-0">
                                                Overdue
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pending Requests */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pt-4 pb-3">
                        <CardTitle className="text-sm font-medium">
                            Pending Requests
                        </CardTitle>
                        <Link href="/student/borrow-requests">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                            >
                                View all
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {pendingRequests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <ClipboardList className="mb-2 size-7 text-muted-foreground/30" />
                                <p className="text-sm text-muted-foreground">
                                    No pending requests
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Your borrow requests will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {pendingRequests.map((r) => (
                                    <div
                                        key={r.id}
                                        className="flex items-start gap-3 rounded-lg border border-dashed p-3"
                                    >
                                        <ClipboardList className="mt-0.5 size-4 shrink-0 text-amber-500" />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {r.equipment.name}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                For{' '}
                                                {new Date(
                                                    r.borrow_date,
                                                ).toLocaleDateString()}
                                            </p>
                                            <span className="badge badge-xs badge-warning mt-1">
                                                Pending approval
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}

function StatCard({
    title,
    value,
    icon,
    iconBg,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    iconBg: string;
}) {
    return (
        <Card>
            <CardContent className="p-3">
                <div
                    className={`mb-2 flex size-7 items-center justify-center rounded-md ${iconBg}`}
                >
                    {icon}
                </div>
                <div className="text-xl font-bold tracking-tight">{value}</div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {title}
                </p>
            </CardContent>
        </Card>
    );
}
