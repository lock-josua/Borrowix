import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, XCircle } from 'lucide-react';
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

export default function Show({ borrowRequest: r }: Props) {
    const [cancelOpen, setCancelOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    function handleCancel() {
        setProcessing(true);
        router.post(
            `/student/borrow-requests/${r.id}/cancel`,
            {},
            {
                onSuccess: () => {
                    setCancelOpen(false);
                    setProcessing(false);
                },
                onError: () => setProcessing(false),
            },
        );
    }

    const actionButtons = (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href="/student/borrow-requests" className="gap-1.5">
                    <ArrowLeft className="size-3.5" /> Back
                </Link>
            </Button>
            {r.status === 'pending' && (
                <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setCancelOpen(true)}
                >
                    <XCircle className="size-3.5" /> Cancel Request
                </Button>
            )}
        </div>
    );

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Request Details" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <div>
                   <PageHeader
                        title="Request Details"
                        description={`Request #${r.id}`}
                        actions={actionButtons}
                    />
                    <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                         <StatusBadge status={r.status} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

                    <DetailCard title="Schedule & Purpose">
                        <DetailRow
                            label="Borrow Date"
                            value={new Date(r.borrow_date).toLocaleString()}
                        />
                        <DetailRow
                            label="Expected Return"
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
                            {r.processed_at && (
                                <DetailRow
                                    label="Processed At"
                                    value={new Date(r.processed_at).toLocaleString()}
                                />
                            )}
                            {r.remarks && (
                                <DetailRow label="Remarks" value={r.remarks} />
                            )}
                        </DetailCard>
                    )}
                </div>
                
                {r.transaction && (
                    <div className="flex justify-start">
                        <Button variant="link" asChild className="px-0">
                            <Link
                                href={`/student/history/${r.transaction.id}`}
                                className="text-primary hover:underline"
                            >
                                View active loan →
                            </Link>
                        </Button>
                    </div>
                )}
            </motion.div>

            <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Request?</DialogTitle>
                        <DialogDescription>
                            Cancel your request for{' '}
                            <strong>{r.equipment.name}</strong>? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCancelOpen(false)}
                            disabled={processing}
                        >
                            Keep
                        </Button>
                        <Button variant="destructive" onClick={handleCancel} disabled={processing}>
                            {processing && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Cancel Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StudentLayout>
    );
}
