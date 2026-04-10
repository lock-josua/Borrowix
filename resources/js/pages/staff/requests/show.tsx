import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { DetailCard } from '@/components/detail-card';
import { DetailRow } from '@/components/detail-row';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import StaffLayout from '@/layouts/StaffLayout';
import type { BreadcrumbItem } from '@/types';

interface BorrowRequest {
    id: number;
    status: string;
    purpose: string;
    borrow_date: string;
    expected_return_date: string;
    remarks: string | null;
    processed_at: string | null;
    requester: { name: string; email: string };
    equipment: {
        name: string;
        brand: string | null;
        model: string | null;
        category: { name: string } | null;
    };
    processedBy: { name: string } | null;
}

interface Props {
    borrowRequest: BorrowRequest;
}

export default function RequestShow({ borrowRequest: r }: Props) {
    const { can } = usePage().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/staff/dashboard' },
        { title: 'Requests', href: '/staff/requests' },
        { title: `Request #${r.id}`, href: `/staff/requests/${r.id}` },
    ];

    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [processing, setProcessing] = useState(false);

    function handleApprove() {
        setProcessing(true);
        router.post(
            `/staff/requests/${r.id}/approve`,
            { remarks },
            {
                onSuccess: () => {
                    setApproveOpen(false);
                    setProcessing(false);
                },
                onError: () => setProcessing(false),
            },
        );
    }

    function handleReject() {
        setProcessing(true);
        router.post(
            `/staff/requests/${r.id}/reject`,
            { remarks },
            {
                onSuccess: () => {
                    setRejectOpen(false);
                    setProcessing(false);
                },
                onError: () => setProcessing(false),
            },
        );
    }

    const actionButtons = (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href="/staff/requests" className="gap-1.5">
                    <ArrowLeft className="size-3.5" /> Back
                </Link>
            </Button>
            {can.approve_requests && r.status === 'pending' && (
                <>
                    <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setApproveOpen(true)}
                    >
                        <CheckCircle className="size-3.5" /> Approve
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setRejectOpen(true)}
                    >
                        <XCircle className="size-3.5" /> Reject
                    </Button>
                </>
            )}
        </div>
    );

    return (
        <StaffLayout breadcrumbs={breadcrumbs}>
            <Head title={`Request #${r.id}`} />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title={`Request #${r.id}`}
                    description={`Submitted by ${r.requester.name}`}
                    actions={actionButtons}
                />

                <div className="flex items-center gap-2">
                    <StatusBadge status={r.status} />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <DetailCard title="Requester">
                        <DetailRow label="Name" value={r.requester.name} />
                        <DetailRow label="Email" value={r.requester.email} />
                    </DetailCard>

                    <DetailCard title="Equipment">
                        <DetailRow label="Name" value={r.equipment.name} />
                        <DetailRow
                            label="Category"
                            value={r.equipment.category?.name ?? '—'}
                        />
                        {r.equipment.brand && (
                            <DetailRow label="Brand" value={r.equipment.brand} />
                        )}
                        {r.equipment.model && (
                            <DetailRow label="Model" value={r.equipment.model} />
                        )}
                    </DetailCard>

                    <DetailCard title="Schedule">
                        <DetailRow
                            label="Borrow Date"
                            value={new Date(r.borrow_date).toLocaleString()}
                        />
                        <DetailRow
                            label="Return Date"
                            value={new Date(r.expected_return_date).toLocaleString()}
                        />
                        <DetailRow label="Purpose" value={r.purpose} />
                    </DetailCard>

                    {r.processedBy && (
                        <DetailCard title="Processing Details">
                            <DetailRow
                                label="Processed By"
                                value={r.processedBy.name}
                            />
                            <DetailRow
                                label="Processed At"
                                value={new Date(r.processed_at!).toLocaleString()}
                            />
                            {r.remarks && (
                                <DetailRow label="Remarks" value={r.remarks} />
                            )}
                        </DetailCard>
                    )}
                </div>
            </motion.div>

            <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Request</DialogTitle>
                        <DialogDescription>
                            Approving the borrow request for{' '}
                            <strong>{r.equipment.name}</strong>. You may add an optional remark.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        placeholder="Remarks (optional)"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setApproveOpen(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleApprove} disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Request</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this request.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        placeholder="Reason (required)"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRejectOpen(false)}
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
        </StaffLayout>
    );
}
