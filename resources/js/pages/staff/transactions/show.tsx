import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StaffLayout from '@/layouts/StaffLayout';
import type { BreadcrumbItem } from '@/types';

interface Transaction {
    id: number;
    status: 'active' | 'returned' | 'overdue';
    issued_at: string;
    due_date: string;
    returned_at: string | null;
    return_condition_notes: string | null;
    borrower: { name: string; email: string };
    equipment: { name: string; brand: string | null; model: string | null };
    issuedBy: { name: string } | null;
    borrowRequest: {
        purpose: string;
        borrow_date: string;
        expected_return_date: string;
    } | null;
}

interface Props {
    transaction: Transaction;
}

export default function TransactionShow({ transaction: t }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/staff/dashboard' },
        { title: 'Transactions', href: '/staff/transactions' },
        { title: `Transaction #${t.id}`, href: `/staff/transactions/${t.id}` },
    ];

    const [returnOpen, setReturnOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [fine, setFine] = useState('');
    const [fineReason, setFineReason] = useState('');
    const [processing, setProcessing] = useState(false);

    function handleReturn() {
        setProcessing(true);
        router.post(
            `/staff/transactions/${t.id}/return`,
            {
                return_condition_notes: notes,
                fine_amount: fine || null,
                fine_reason: fineReason || null,
            },
            {
                onSuccess: () => {
                    setReturnOpen(false);
                    setProcessing(false);
                    setNotes('');
                    setFine('');
                    setFineReason('');
                },
                onError: (errors) => {
                    setProcessing(false);
                    toast.error(errors.message || 'Failed to mark as returned');
                },
            },
        );
    }

    const actionButtons = (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href="/staff/transactions" className="gap-1.5">
                    <ArrowLeft className="size-3.5" /> Back
                </Link>
            </Button>
            {t.status !== 'returned' && (
                <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setReturnOpen(true)}
                >
                    <RotateCcw className="size-3.5" /> Mark Returned
                </Button>
            )}
        </div>
    );

    return (
        <StaffLayout breadcrumbs={breadcrumbs}>
            <Head title={`Transaction #${t.id}`} />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <div>
                    <PageHeader
                        title={`Transaction #${t.id}`}
                        description={`Issued to ${t.borrower.name}`}
                        actions={actionButtons}
                    />
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <StatusBadge status={t.status} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <DetailCard title="Borrower">
                        <DetailRow label="Name" value={t.borrower.name} />
                        <DetailRow label="Email" value={t.borrower.email} />
                    </DetailCard>

                    <DetailCard title="Equipment">
                        <DetailRow label="Name" value={t.equipment.name} />
                        {t.equipment.brand && (
                            <DetailRow
                                label="Brand"
                                value={t.equipment.brand}
                            />
                        )}
                        {t.equipment.model && (
                            <DetailRow
                                label="Model"
                                value={t.equipment.model}
                            />
                        )}
                    </DetailCard>

                    <DetailCard title="Timeline">
                        <DetailRow
                            label="Issued At"
                            value={new Date(t.issued_at).toLocaleString()}
                        />
                        <DetailRow
                            label="Due Date"
                            value={new Date(t.due_date).toLocaleString()}
                        />
                        {t.returned_at && (
                            <DetailRow
                                label="Returned At"
                                value={new Date(t.returned_at).toLocaleString()}
                            />
                        )}
                        {t.issuedBy && (
                            <DetailRow
                                label="Issued By"
                                value={t.issuedBy.name}
                            />
                        )}
                    </DetailCard>

                    {t.borrowRequest && (
                        <DetailCard title="Request Details">
                            <DetailRow
                                label="Purpose"
                                value={t.borrowRequest.purpose}
                            />
                            <DetailRow
                                label="Borrow Date"
                                value={new Date(
                                    t.borrowRequest.borrow_date,
                                ).toLocaleString()}
                            />
                            <DetailRow
                                label="Expected Return"
                                value={new Date(
                                    t.borrowRequest.expected_return_date,
                                ).toLocaleString()}
                            />
                        </DetailCard>
                    )}

                    {t.return_condition_notes && (
                        <DetailCard title="Return Condition">
                            <DetailRow
                                label="Notes"
                                value={t.return_condition_notes}
                            />
                        </DetailCard>
                    )}
                </div>
            </motion.div>

            <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark as Returned</DialogTitle>
                        <DialogDescription>
                            Confirm the return of{' '}
                            <strong>{t.equipment.name}</strong> from{' '}
                            <strong>{t.borrower.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Condition Notes</Label>
                            <Textarea
                                placeholder="Any damage or conditions..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Fine Amount (₱)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={fine}
                                    onChange={(e) => setFine(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Fine Reason</Label>
                                <Input
                                    placeholder="Optional"
                                    value={fineReason}
                                    onChange={(e) =>
                                        setFineReason(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setReturnOpen(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleReturn} disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            Confirm Return
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StaffLayout>
    );
}
