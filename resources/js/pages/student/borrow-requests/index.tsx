import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Eye, XCircle, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import StudentLayout from '@/layouts/StudentLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/student/dashboard' },
    { title: 'My Requests', href: '/student/borrow-requests' },
];

interface BorrowRequest {
    id: number;
    equipment: { name: string };
    borrow_date: string;
    expected_return_date: string;
    status: string;
}

interface Props {
    requests: {
        data: BorrowRequest[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
}

const statusBadge: Record<string, string> = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-error',
    canceled: 'badge-neutral',
};

const statusLabel: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    canceled: 'Canceled',
};

export default function StudentRequestsIndex({ requests }: Props) {
    const [cancelTarget, setCancelTarget] = useState<BorrowRequest | null>(
        null,
    );

    function handleCancel() {
        if (!cancelTarget) return;
        router.post(
            `/student/borrow-requests/${cancelTarget.id}/cancel`,
            {},
            {
                onSuccess: () => setCancelTarget(null),
            },
        );
    }

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="My Requests" />

            <div className="flex flex-col gap-4 p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            My Requests
                        </h1>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Track your borrow requests.
                        </p>
                    </div>
                    <Link href="/student/borrow-requests/create">
                        <Button size="sm">
                            <Plus className="mr-1.5 size-3.5" />
                            New
                        </Button>
                    </Link>
                </div>

                {/* Request list */}
                {requests.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <ClipboardList className="mb-3 size-10 text-muted-foreground/30" />
                        <p className="font-medium text-muted-foreground">
                            No requests yet
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Submit a borrow request to get started.
                        </p>
                        <Link href="/student/browse" className="mt-4">
                            <Button size="sm">Browse equipment</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {requests.data.map((r) => (
                            <div
                                key={r.id}
                                className="flex items-start gap-3 rounded-xl border bg-card p-3.5 transition-colors hover:bg-muted/30"
                            >
                                {/* Status dot */}
                                <div className="mt-1 shrink-0">
                                    <span
                                        className={`badge badge-sm capitalize ${statusBadge[r.status] ?? 'badge-ghost'}`}
                                    >
                                        {statusLabel[r.status] ?? r.status}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {r.equipment.name}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {new Date(
                                            r.borrow_date,
                                        ).toLocaleDateString()}{' '}
                                        →{' '}
                                        {new Date(
                                            r.expected_return_date,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex shrink-0 items-center gap-1">
                                    <Link
                                        href={`/student/borrow-requests/${r.id}`}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                        >
                                            <Eye className="size-3.5" />
                                        </Button>
                                    </Link>
                                    {r.status === 'pending' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-destructive hover:text-destructive"
                                            onClick={() => setCancelTarget(r)}
                                        >
                                            <XCircle className="size-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {requests.last_page > 1 && (
                    <div className="flex items-center justify-between border-t pt-4">
                        <p className="text-xs text-muted-foreground">
                            Page {requests.current_page} of {requests.last_page}
                        </p>
                        <div className="flex gap-2">
                            {requests.prev_page_url && (
                                <Link href={requests.prev_page_url}>
                                    <Button variant="outline" size="sm">
                                        ← Prev
                                    </Button>
                                </Link>
                            )}
                            {requests.next_page_url && (
                                <Link href={requests.next_page_url}>
                                    <Button variant="outline" size="sm">
                                        Next →
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Cancel dialog */}
            <Dialog
                open={!!cancelTarget}
                onOpenChange={() => setCancelTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Request?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Cancel your request for{' '}
                        <strong>{cancelTarget?.equipment.name}</strong>? This
                        cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCancelTarget(null)}
                        >
                            Keep
                        </Button>
                        <Button variant="destructive" onClick={handleCancel}>
                            Cancel Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StudentLayout>
    );
}
