import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, XCircle } from 'lucide-react';
import { useState } from 'react';
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
    { title: 'Request Details', href: '#' },
];

interface BorrowRequest {
    id: number;
    status: 'pending' | 'approved' | 'rejected' | 'canceled';
    purpose: string;
    borrow_date: string;
    expected_return_date: string;
    remarks: string | null;
    processed_at: string | null;
    equipment: {
        name: string;
        brand: string | null;
        model: string | null;
        category: { name: string } | null;
    };
    processedBy: { name: string } | null;
    transaction: { id: number } | null;
}

interface Props {
    borrowRequest: BorrowRequest;
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

export default function Show({ borrowRequest }: Props) {
    const [cancelOpen, setCancelOpen] = useState(false);

    function handleCancel() {
        router.post(
            `/student/borrow-requests/${borrowRequest.id}/cancel`,
            {},
            {
                onSuccess: () => setCancelOpen(false),
            },
        );
    }

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Request Details" />

            <div className="flex flex-col gap-4 p-4 lg:p-6">
                {/* Back link */}
                <Link
                    href="/student/borrow-requests"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    Back to My Requests
                </Link>

                {/* Status badge */}
                <div>
                    <span
                        className={`badge badge-sm capitalize ${statusBadge[borrowRequest.status] ?? 'badge-ghost'}`}
                    >
                        {statusLabel[borrowRequest.status] ??
                            borrowRequest.status}
                    </span>
                </div>

                {/* Detail card */}
                <div className="rounded-xl border bg-card p-4">
                    <div className="space-y-4 text-sm">
                        {/* Equipment */}
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Equipment
                            </p>
                            <p className="font-medium">
                                {borrowRequest.equipment.name}
                            </p>
                            {borrowRequest.equipment.category && (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {borrowRequest.equipment.category.name}
                                </p>
                            )}
                            {(borrowRequest.equipment.brand ||
                                borrowRequest.equipment.model) && (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {[
                                        borrowRequest.equipment.brand,
                                        borrowRequest.equipment.model,
                                    ]
                                        .filter(Boolean)
                                        .join(' - ')}
                                </p>
                            )}
                        </div>

                        {/* Purpose */}
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Purpose
                            </p>
                            <p>{borrowRequest.purpose}</p>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Borrow Date
                                </p>
                                <p>
                                    {new Date(
                                        borrowRequest.borrow_date,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Expected Return
                                </p>
                                <p>
                                    {new Date(
                                        borrowRequest.expected_return_date,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Processed by */}
                        {borrowRequest.processedBy && (
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Processed By
                                </p>
                                <p>{borrowRequest.processedBy.name}</p>
                            </div>
                        )}

                        {/* Remarks */}
                        {borrowRequest.remarks && (
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Remarks
                                </p>
                                <p>{borrowRequest.remarks}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transaction link */}
                {borrowRequest.transaction && (
                    <Link
                        href={`/student/history/${borrowRequest.transaction.id}`}
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                        View active loan →
                    </Link>
                )}

                {/* Cancel button */}
                {borrowRequest.status === 'pending' && (
                    <div className="pt-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setCancelOpen(true)}
                        >
                            <XCircle className="mr-1.5 size-3.5" />
                            Cancel Request
                        </Button>
                    </div>
                )}
            </div>

            {/* Cancel dialog */}
            <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Request?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Cancel your request for{' '}
                        <strong>{borrowRequest.equipment.name}</strong>? This
                        cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCancelOpen(false)}
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
