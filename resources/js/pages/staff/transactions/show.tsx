import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
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

const statusBadge: Record<string, string> = {
    active: 'badge-info',
    returned: 'badge-success',
    overdue: 'badge-error',
};

export default function TransactionShow({ transaction: t }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/staff/dashboard' },
        { title: 'Transactions', href: '/staff/transactions' },
        { title: `Transaction #${t.id}`, href: `/staff/transactions/${t.id}` },
    ];

    const [returnOpen, setReturnOpen] = useState(false);
    const [notes, setNotes] = useState('');

    function handleReturn() {
        router.post(
            `/staff/transactions/${t.id}/return`,
            {
                return_condition_notes: notes,
            },
            { onSuccess: () => setReturnOpen(false) },
        );
    }

    return (
        <StaffLayout breadcrumbs={breadcrumbs}>
            <Head title={`Transaction #${t.id}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/staff/transactions">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">
                                Transaction #{t.id}
                            </h1>
                            <span
                                className={`badge capitalize ${statusBadge[t.status]}`}
                            >
                                {t.status}
                            </span>
                        </div>
                    </div>
                    {t.status !== 'returned' && (
                        <Button onClick={() => setReturnOpen(true)}>
                            <RotateCcw className="mr-2 size-4" />
                            Mark Returned
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Borrower
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <InfoRow label="Name" value={t.borrower.name} />
                            <InfoRow label="Email" value={t.borrower.email} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Equipment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <InfoRow label="Name" value={t.equipment.name} />
                            {t.equipment.brand && (
                                <InfoRow
                                    label="Brand"
                                    value={t.equipment.brand}
                                />
                            )}
                            {t.equipment.model && (
                                <InfoRow
                                    label="Model"
                                    value={t.equipment.model}
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <InfoRow
                                label="Issued At"
                                value={new Date(t.issued_at).toLocaleString()}
                            />
                            <InfoRow
                                label="Due Date"
                                value={new Date(t.due_date).toLocaleString()}
                            />
                            {t.returned_at && (
                                <InfoRow
                                    label="Returned At"
                                    value={new Date(
                                        t.returned_at,
                                    ).toLocaleString()}
                                />
                            )}
                            {t.issuedBy && (
                                <InfoRow
                                    label="Issued By"
                                    value={t.issuedBy.name}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {t.borrowRequest && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Request Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <InfoRow
                                    label="Purpose"
                                    value={t.borrowRequest.purpose}
                                />
                                <InfoRow
                                    label="Borrow Date"
                                    value={new Date(
                                        t.borrowRequest.borrow_date,
                                    ).toLocaleString()}
                                />
                                <InfoRow
                                    label="Expected Return"
                                    value={new Date(
                                        t.borrowRequest.expected_return_date,
                                    ).toLocaleString()}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {t.return_condition_notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Return Condition
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <InfoRow
                                    label="Notes"
                                    value={t.return_condition_notes}
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark as Returned</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label>Condition Notes</Label>
                            <Textarea
                                placeholder="Any damage or notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setReturnOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleReturn}>Confirm Return</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StaffLayout>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between border-b pb-2 last:border-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
