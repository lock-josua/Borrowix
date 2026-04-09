import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CheckCircle, Eye, XCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

export default function RequestsIndex({ requests, filters }: Props) {
    const [approveTarget, setApproveTarget] = useState<BorrowRequest | null>(
        null,
    );
    const [rejectTarget, setRejectTarget] = useState<BorrowRequest | null>(
        null,
    );
    const [remarks, setRemarks] = useState('');
    const [processing, setProcessing] = useState(false);

    function handleFilterChange(key: string, value: string) {
        router.get(
            '/admin/requests',
            { ...filters, [key]: value || undefined },
            { preserveState: true },
        );
    }

    function handleApprove() {
        if (!approveTarget) return;
        setProcessing(true);
        router.post(
            `/admin/requests/${approveTarget.id}/approve`,
            { remarks },
            {
                onSuccess: () => {
                    setApproveTarget(null);
                    setRemarks('');
                    setProcessing(false);
                },
                onError: (errors) => {
                    setProcessing(false);
                    toast.error(errors.message || 'Failed to approve request');
                },
            },
        );
    }

    function handleReject() {
        if (!rejectTarget) return;
        setProcessing(true);
        router.post(
            `/admin/requests/${rejectTarget.id}/reject`,
            { remarks },
            {
                onSuccess: () => {
                    setRejectTarget(null);
                    setRemarks('');
                    setProcessing(false);
                },
                onError: (errors) => {
                    setProcessing(false);
                    toast.error(errors.message || 'Failed to reject request');
                },
            },
        );
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Borrow Requests" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Borrow Requests"
                    description="Review and process student borrow requests."
                />

                {/* Filter bar */}
                <Card className="flex flex-row flex-wrap items-center gap-2 p-3 py-3">
                    <Select
                        value={filters.status ?? 'all'}
                        onValueChange={(v) =>
                            handleFilterChange('status', v === 'all' ? '' : v)
                        }
                    >
                        <SelectTrigger className="h-9 w-[150px] bg-muted/20 text-sm">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </Card>

                {/* Table */}
                <Card className="overflow-hidden border-border/60 p-0">
                    <DataTable
                        columns={[
                            {
                                key: 'requester',
                                label: 'Requester',
                                width: '28%',
                                render: (r) => (
                                    <span className="block truncate font-medium text-foreground">
                                        {r.requester.name}
                                    </span>
                                ),
                            },
                            {
                                key: 'equipment',
                                label: 'Equipment',
                                width: '25%',
                                render: (r) => (
                                    <span className="block truncate text-muted-foreground">
                                        {r.equipment.name}
                                    </span>
                                ),
                            },
                            {
                                key: 'borrow_date',
                                label: 'Borrow Date',
                                width: '14%',
                                render: (r) => (
                                    <span className="text-xs text-muted-foreground">
                                        {r.borrow_date}
                                    </span>
                                ),
                            },
                            {
                                key: 'return_date',
                                label: 'Return Date',
                                width: '14%',
                                render: (r) => (
                                    <span className="text-xs text-muted-foreground">
                                        {r.expected_return_date}
                                    </span>
                                ),
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                width: '11%',
                                align: 'center',
                                render: (r) => (
                                    <StatusBadge status={r.status} />
                                ),
                            },
                            {
                                key: 'actions',
                                label: '',
                                width: '8%',
                                align: 'right',
                                render: (r) => (
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7"
                                            asChild
                                        >
                                            <Link
                                                href={`/admin/requests/${r.id}`}
                                            >
                                                <Eye className="size-3.5" />
                                            </Link>
                                        </Button>
                                        {r.status === 'pending' && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 text-emerald-600 hover:bg-emerald-50"
                                                    onClick={() =>
                                                        setApproveTarget(r)
                                                    }
                                                >
                                                    <CheckCircle className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 text-destructive hover:bg-red-50"
                                                    onClick={() =>
                                                        setRejectTarget(r)
                                                    }
                                                >
                                                    <XCircle className="size-3.5" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        data={requests.data}
                        keyExtractor={(r) => r.id}
                        emptyMessage="No borrow requests to display"
                    />
                    <TablePagination
                        currentPage={requests.current_page}
                        lastPage={requests.last_page}
                        nextUrl={requests.next_page_url}
                        prevUrl={requests.prev_page_url}
                    />
                </Card>

                {/* Dialogs */}
                <Dialog
                    open={!!approveTarget}
                    onOpenChange={() => setApproveTarget(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Approve Request</DialogTitle>
                            <DialogDescription>
                                Approving {approveTarget?.requester.name}'s
                                request for {approveTarget?.equipment.name}.
                            </DialogDescription>
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
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleApprove}
                                disabled={processing}
                            >
                                {processing && (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                )}
                                Approve
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={!!rejectTarget}
                    onOpenChange={() => setRejectTarget(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Request</DialogTitle>
                            <DialogDescription>
                                Rejecting {rejectTarget?.requester.name}'s
                                request for {rejectTarget?.equipment.name}.
                            </DialogDescription>
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
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={!remarks || processing}
                            >
                                {processing && (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                )}
                                Reject
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </AdminLayout>
    );
}
