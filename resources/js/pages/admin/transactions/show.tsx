import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

interface Transaction {
    id: number;
    status: string;
    issued_at: string;
    due_date: string;
    returned_at: string | null;
    fine_amount: number;
    fine_reason: string | null;
    return_condition_notes: string | null;
    borrower: { name: string; email: string };
    equipment: {
        name: string;
        brand: string | null;
        model: string | null;
        category: { name: string } | null;
    };
    issuedBy: { name: string } | null;
    returnedTo: { name: string } | null;
}

interface Props {
    transaction: Transaction;
}

export default function TransactionShow({ transaction: t }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Transactions', href: '/admin/transactions' },
        { title: `Transaction #${t.id}`, href: `/admin/transactions/${t.id}` },
    ];

    const [returnOpen, setReturnOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [fine, setFine] = useState('');
    const [processing, setProcessing] = useState(false);

    function handleReturn() {
        setProcessing(true);
        router.post(
            `/admin/transactions/${t.id}/return`,
            {
                return_condition_notes: notes,
                fine_amount: fine,
            },
            {
                onSuccess: () => {
                    setReturnOpen(false);
                    setProcessing(false);
                },
                onError: (errors) => {
                    setProcessing(false);
                    toast.error(errors.message || 'Failed to mark as returned');
                },
            },
        );
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Transaction #${t.id}`} />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title={`Transaction #${t.id}`}
                    description={`Issued on ${t.issued_at}`}
                    actions={
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/transactions">
                                    <ArrowLeft className="mr-1.5 size-3.5" />{' '}
                                    Back
                                </Link>
                            </Button>
                            {t.status !== 'returned' && (
                                <Button
                                    size="sm"
                                    onClick={() => setReturnOpen(true)}
                                >
                                    <RotateCcw className="mr-1.5 size-3.5" />{' '}
                                    Mark Returned
                                </Button>
                            )}
                        </div>
                    }
                />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-3">
                                    {[
                                        ['Borrower', t.borrower.name],
                                        ['Equipment', t.equipment.name],
                                        ['Issued Date', t.issued_at],
                                        ['Due Date', t.due_date],
                                    ].map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="flex items-start justify-between border-b border-border py-2 last:border-0"
                                        >
                                            <dt className="w-32 shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                {label}
                                            </dt>
                                            <dd className="text-right text-sm text-foreground">
                                                {value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </CardContent>
                        </Card>

                        {(t.fine_amount > 0 || t.return_condition_notes) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Return Info
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <dl className="space-y-3">
                                        {t.fine_amount > 0 && (
                                            <div className="flex items-start justify-between border-b border-border py-2 last:border-0">
                                                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    Fine
                                                </dt>
                                                <dd className="text-right text-sm font-bold text-destructive">
                                                    ₱{t.fine_amount}
                                                </dd>
                                            </div>
                                        )}
                                        {t.return_condition_notes && (
                                            <div className="flex flex-col gap-1 border-b border-border py-2 last:border-0">
                                                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    Condition Notes
                                                </dt>
                                                <dd className="text-sm text-foreground">
                                                    {t.return_condition_notes}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <StatusBadge status={t.status} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-xs">
                                <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Issued
                                    </div>
                                    <div>{t.issued_at}</div>
                                    {t.issuedBy && (
                                        <div className="italic">
                                            By {t.issuedBy.name}
                                        </div>
                                    )}
                                </div>
                                {t.returned_at && (
                                    <div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase">
                                            Returned
                                        </div>
                                        <div>{t.returned_at}</div>
                                        {t.returnedTo && (
                                            <div className="italic">
                                                To {t.returnedTo.name}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Mark as Returned</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label>Condition Notes</Label>
                                <Input
                                    placeholder="Any damage or notes..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
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
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setReturnOpen(false)}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleReturn}
                                disabled={processing}
                            >
                                {processing && (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                )}
                                Confirm Return
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </AdminLayout>
    );
}
