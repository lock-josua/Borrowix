import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, RotateCcw } from 'lucide-react';
import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
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

export default function TransactionsIndex({ transactions, filters }: Props) {
    const [returnTarget, setReturnTarget] = useState<Transaction | null>(null);
    const [notes, setNotes] = useState('');
    const [fine, setFine] = useState('');

    function handleFilterChange(key: string, value: string) {
        router.get(
            '/admin/transactions',
            { ...filters, [key]: value || undefined },
            { preserveState: true },
        );
    }

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

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Transactions"
                    description="Track active loans and returns."
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
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                    </Select>
                </Card>

                {/* Table */}
                <Card className="overflow-hidden border-border/60 p-0">
                    <DataTable
                        columns={[
                            {
                                key: 'borrower',
                                label: 'Borrower',
                                width: '25%',
                                render: (t) => (
                                    <span className="block truncate font-medium text-foreground">
                                        {t.borrower.name}
                                    </span>
                                ),
                            },
                            {
                                key: 'equipment',
                                label: 'Equipment',
                                width: '25%',
                                render: (t) => (
                                    <span className="block truncate text-muted-foreground">
                                        {t.equipment.name}
                                    </span>
                                ),
                            },
                            {
                                key: 'borrowed',
                                label: 'Borrowed',
                                width: '14%',
                                render: (t) => (
                                    <span className="text-xs text-muted-foreground">
                                        {t.issued_at}
                                    </span>
                                ),
                            },
                            {
                                key: 'due',
                                label: 'Due',
                                width: '13%',
                                render: (t) => (
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">
                                            {t.due_date}
                                        </span>
                                        {t.fine_amount > 0 && (
                                            <span className="text-[10px] font-bold text-destructive">
                                                ₱{t.fine_amount}
                                            </span>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                width: '11%',
                                align: 'center',
                                render: (t) => (
                                    <StatusBadge status={t.status} />
                                ),
                            },
                            {
                                key: 'overdue',
                                label: 'Overdue',
                                width: '7%',
                                align: 'center',
                                render: (t) =>
                                    t.status === 'overdue' ? (
                                        <span className="font-bold text-destructive">
                                            !
                                        </span>
                                    ) : null,
                            },
                            {
                                key: 'actions',
                                label: '',
                                width: '5%',
                                align: 'right',
                                render: (t) => (
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7"
                                            asChild
                                        >
                                            <Link
                                                href={`/admin/transactions/${t.id}`}
                                            >
                                                <Eye className="size-3.5" />
                                            </Link>
                                        </Button>
                                        {t.status !== 'returned' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7 text-primary hover:bg-primary/5"
                                                onClick={() =>
                                                    setReturnTarget(t)
                                                }
                                            >
                                                <RotateCcw className="size-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        data={transactions.data}
                        keyExtractor={(t) => t.id}
                    />
                    <TablePagination
                        currentPage={transactions.current_page}
                        lastPage={transactions.last_page}
                        nextUrl={transactions.next_page_url}
                        prevUrl={transactions.prev_page_url}
                    />
                </Card>

                <Dialog
                    open={!!returnTarget}
                    onOpenChange={() => setReturnTarget(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Mark as Returned</DialogTitle>
                            <DialogDescription>
                                Record the return condition and any applicable
                                fine.
                            </DialogDescription>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                            <strong>{returnTarget?.borrower.name}</strong>{' '}
                            returning{' '}
                            <strong>{returnTarget?.equipment.name}</strong>.
                        </p>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Condition Notes
                                </Label>
                                <Input
                                    placeholder="Any damage or notes..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Fine Amount (₱)
                                </Label>
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
                            <Button onClick={handleReturn}>
                                Confirm Return
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </AdminLayout>
    );
}
