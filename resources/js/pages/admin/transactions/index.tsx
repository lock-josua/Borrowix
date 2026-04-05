import { Head, Link, router } from '@inertiajs/react';
import { Eye, RotateCcw, ArrowLeftRight } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Transactions', href: '/admin/transactions' },
];

interface Transaction {
    id: number;
    borrower: { name: string };
    equipment: { name: string };
    issued_at: string;
    due_date: string;
    status: string;
    fine_amount: number;
}

interface Props {
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    filters: { status?: string; search?: string };
}

const statusBadge: Record<string, string> = {
    active: 'badge-info',
    returned: 'badge-success',
    overdue: 'badge-error',
};

export default function TransactionsIndex({ transactions, filters }: Props) {
    const [returnTarget, setReturnTarget] = useState<Transaction | null>(null);
    const [notes, setNotes] = useState('');
    const [fine, setFine] = useState('');

    function handleReturn() {
        if (!returnTarget) return;
        router.post(
            `/admin/transactions/${returnTarget.id}/return`,
            {
                return_condition_notes: notes,
                fine_amount: fine,
            },
            {
                onSuccess: () => {
                    setReturnTarget(null);
                    setNotes('');
                    setFine('');
                },
            },
        );
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Transactions
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Track active loans and returns.
                        </p>
                    </div>
                </div>

                {/* Filter pills */}
                <div className="flex flex-wrap gap-2">
                    {['', 'active', 'overdue', 'returned'].map((s) => (
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
                                    '/admin/transactions',
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
                            {transactions.data.length} transaction
                            {transactions.data.length !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <ArrowLeftRight className="mb-3 size-10 text-muted-foreground/40" />
                                <p className="font-medium text-muted-foreground">
                                    No transactions found
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Approved borrow requests will appear here.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Borrower
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Equipment
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Issued
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Due
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Fine
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.data.map((t) => (
                                                <tr
                                                    key={t.id}
                                                    className="border-b transition-colors last:border-0 hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3 font-medium">
                                                        {t.borrower.name}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {t.equipment.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                                        {new Date(
                                                            t.issued_at,
                                                        ).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                                        {new Date(
                                                            t.due_date,
                                                        ).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`badge badge-sm capitalize ${statusBadge[t.status] ?? 'badge-ghost'}`}
                                                        >
                                                            {t.status.replace(
                                                                /_/g,
                                                                ' ',
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {t.fine_amount > 0 ? (
                                                            <span className="font-medium text-amber-600">
                                                                ₱{t.fine_amount}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-1">
                                                            <Link
                                                                href={`/admin/transactions/${t.id}`}
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                >
                                                                    <Eye className="mr-1 size-3.5" />
                                                                    View
                                                                </Button>
                                                            </Link>
                                                            {t.status !==
                                                                'returned' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-primary hover:bg-primary/5"
                                                                    onClick={() =>
                                                                        setReturnTarget(
                                                                            t,
                                                                        )
                                                                    }
                                                                >
                                                                    <RotateCcw className="mr-1 size-3.5" />
                                                                    Return
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {transactions.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t pt-4">
                                        <p className="text-xs text-muted-foreground">
                                            Page {transactions.current_page} of{' '}
                                            {transactions.last_page}
                                        </p>
                                        <div className="flex gap-2">
                                            {transactions.prev_page_url && (
                                                <Link
                                                    href={
                                                        transactions.prev_page_url
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
                                            {transactions.next_page_url && (
                                                <Link
                                                    href={
                                                        transactions.next_page_url
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

            <Dialog
                open={!!returnTarget}
                onOpenChange={() => setReturnTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark as Returned</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        <strong>{returnTarget?.borrower.name}</strong> returning{' '}
                        <strong>{returnTarget?.equipment.name}</strong>.
                    </p>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label>Condition Notes</Label>
                            <Input
                                placeholder="Any damage or notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
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
                            onClick={() => setReturnTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleReturn}>Confirm Return</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
