import { Head, Link, router } from '@inertiajs/react';
import { Eye, CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Requests', href: '/admin/requests' },
];

interface BorrowRequest {
    id: number;
    requester: { name: string };
    equipment: { name: string };
    borrow_date: string;
    expected_return_date: string;
    status: string;
    purpose: string;
}

interface Props {
    requests: {
        data: BorrowRequest[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    filters: { status?: string; search?: string };
}

const statusBadge: Record<string, string> = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-error',
    canceled: 'badge-neutral',
};

export default function RequestsIndex({ requests, filters }: Props) {
    const [approveTarget, setApproveTarget] = useState<BorrowRequest | null>(
        null,
    );
    const [rejectTarget, setRejectTarget] = useState<BorrowRequest | null>(
        null,
    );
    const [remarks, setRemarks] = useState('');

    function handleApprove() {
        if (!approveTarget) return;
        router.post(
            `/admin/requests/${approveTarget.id}/approve`,
            { remarks },
            {
                onSuccess: () => {
                    setApproveTarget(null);
                    setRemarks('');
                },
            },
        );
    }

    function handleReject() {
        if (!rejectTarget) return;
        router.post(
            `/admin/requests/${rejectTarget.id}/reject`,
            { remarks },
            {
                onSuccess: () => {
                    setRejectTarget(null);
                    setRemarks('');
                },
            },
        );
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Borrow Requests" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Borrow Requests
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Review and process student borrow requests.
                        </p>
                    </div>
                </div>

                {/* Filter pills */}
                <div className="flex flex-wrap gap-2">
                    {['', 'pending', 'approved', 'rejected'].map((s) => (
                        <Button
                            key={s}
                            size="sm"
                            variant={
                                filters.status === s ||
                                (!filters.status && s === '')
                                    ? 'default'
                                    : 'outline'
                            }
                            onClick={() =>
                                router.get(
                                    '/admin/requests',
                                    { status: s },
                                    { preserveState: true },
                                )
                            }
                        >
                            {s === ''
                                ? 'All'
                                : s.charAt(0).toUpperCase() + s.slice(1)}
                        </Button>
                    ))}
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {requests.data.length} request
                            {requests.data.length !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {requests.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <ClipboardList className="mb-3 size-10 text-muted-foreground/40" />
                                <p className="font-medium text-muted-foreground">
                                    No requests found
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Student requests will appear here.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Student
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Equipment
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Borrow Date
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Return Date
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {requests.data.map((r) => (
                                                <tr
                                                    key={r.id}
                                                    className="border-b transition-colors last:border-0 hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3 font-medium">
                                                        {r.requester.name}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {r.equipment.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                                        {new Date(
                                                            r.borrow_date,
                                                        ).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                                        {new Date(
                                                            r.expected_return_date,
                                                        ).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`badge badge-sm capitalize ${statusBadge[r.status] ?? 'badge-ghost'}`}
                                                        >
                                                            {r.status.replace(
                                                                /_/g,
                                                                ' ',
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-1">
                                                            <Link
                                                                href={`/admin/requests/${r.id}`}
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                >
                                                                    <Eye className="mr-1 size-3.5" />
                                                                    View
                                                                </Button>
                                                            </Link>
                                                            {r.status ===
                                                                'pending' && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                                                        onClick={() =>
                                                                            setApproveTarget(
                                                                                r,
                                                                            )
                                                                        }
                                                                    >
                                                                        <CheckCircle className="mr-1 size-3.5" />
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-destructive hover:bg-red-50 hover:text-destructive"
                                                                        onClick={() =>
                                                                            setRejectTarget(
                                                                                r,
                                                                            )
                                                                        }
                                                                    >
                                                                        <XCircle className="mr-1 size-3.5" />
                                                                        Reject
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {requests.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t pt-4">
                                        <p className="text-xs text-muted-foreground">
                                            Page {requests.current_page} of{' '}
                                            {requests.last_page}
                                        </p>
                                        <div className="flex gap-2">
                                            {requests.prev_page_url && (
                                                <Link
                                                    href={
                                                        requests.prev_page_url
                                                    }
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        ← Previous
                                                    </Button>
                                                </Link>
                                            )}
                                            {requests.next_page_url && (
                                                <Link
                                                    href={
                                                        requests.next_page_url
                                                    }
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Next →
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Approve Dialog */}
            <Dialog
                open={!!approveTarget}
                onOpenChange={() => setApproveTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Request</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Approving{' '}
                        <strong>{approveTarget?.requester.name}</strong>'s
                        request for{' '}
                        <strong>{approveTarget?.equipment.name}</strong>.
                    </p>
                    <Input
                        placeholder="Remarks (optional)"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setApproveTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleApprove}>Approve</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog
                open={!!rejectTarget}
                onOpenChange={() => setRejectTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Request</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Rejecting{' '}
                        <strong>{rejectTarget?.requester.name}</strong>'s
                        request for{' '}
                        <strong>{rejectTarget?.equipment.name}</strong>.
                    </p>
                    <Input
                        placeholder="Reason for rejection (required)"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRejectTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={!remarks}
                        >
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
