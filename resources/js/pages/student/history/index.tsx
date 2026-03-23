import { Head, Link } from '@inertiajs/react';
import { History, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/layouts/StudentLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/student/dashboard' },
    { title: 'My History', href: '/student/history' },
];

interface Transaction {
    id: number;
    equipment: { name: string };
    issued_at: string;
    returned_at: string | null;
    due_date: string;
    status: string;
    fine_amount: number;
}

interface Props {
    history: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
}

const statusBadge: Record<string, string> = {
    active: 'badge-info',
    returned: 'badge-success',
    overdue: 'badge-error',
};

export default function StudentHistory({ history }: Props) {
    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="My History" />

            <div className="flex flex-col gap-4 p-4 lg:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        My History
                    </h1>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        All your past and active equipment loans.
                    </p>
                </div>

                {/* History list */}
                {history.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <History className="mb-3 size-10 text-muted-foreground/30" />
                        <p className="font-medium text-muted-foreground">
                            No history yet
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Your borrowing history will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {history.data.map((t) => (
                            <div
                                key={t.id}
                                className={`rounded-xl border bg-card p-3.5 transition-colors hover:bg-muted/30 ${
                                    t.status === 'overdue'
                                        ? 'border-red-200 dark:border-red-900/30'
                                        : ''
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="min-w-0 flex-1">
                                        {/* Equipment name + status */}
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-medium">
                                                {t.equipment.name}
                                            </p>
                                            <span
                                                className={`badge badge-xs shrink-0 capitalize ${statusBadge[t.status] ?? 'badge-ghost'}`}
                                            >
                                                {t.status}
                                            </span>
                                        </div>

                                        {/* Dates */}
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Issued{' '}
                                            {new Date(
                                                t.issued_at,
                                            ).toLocaleDateString()}
                                            {' · '}
                                            Due{' '}
                                            {new Date(
                                                t.due_date,
                                            ).toLocaleDateString()}
                                        </p>
                                        {t.returned_at && (
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                                Returned{' '}
                                                {new Date(
                                                    t.returned_at,
                                                ).toLocaleDateString()}
                                            </p>
                                        )}

                                        {/* Fine */}
                                        {t.fine_amount > 0 && (
                                            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5">
                                                <AlertTriangle className="size-3 text-amber-500" />
                                                <span className="text-[11px] font-semibold text-amber-600">
                                                    Fine: ₱{t.fine_amount}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* View button */}
                                    <Link
                                        href={`/student/history/${t.id}`}
                                        className="shrink-0"
                                    >
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                        >
                                            View
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {history.last_page > 1 && (
                    <div className="flex items-center justify-between border-t pt-4">
                        <p className="text-xs text-muted-foreground">
                            Page {history.current_page} of {history.last_page}
                        </p>
                        <div className="flex gap-2">
                            {history.prev_page_url && (
                                <Link href={history.prev_page_url}>
                                    <Button variant="outline" size="sm">
                                        ← Prev
                                    </Button>
                                </Link>
                            )}
                            {history.next_page_url && (
                                <Link href={history.next_page_url}>
                                    <Button variant="outline" size="sm">
                                        Next →
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
