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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StaffLayout from '@/layouts/StaffLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/staff/dashboard' },
    { title: 'Transactions', href: '/staff/transactions' },
];

interface Transaction {
    id: number;
    borrower: { name: string };
    equipment: { name: string };
    due_date: string;
    status: string;
}

interface Props {
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    filters: { status?: string };
}

export default function StaffTransactionsIndex({ transactions, filters }: Props) {
    const [returnTarget, setReturnTarget] = useState<Transaction | null>(null);
    const [notes, setNotes] = useState('');

    function handleFilterChange(key: string, value: string) {
        router.get('/staff/transactions', { ...filters, [key]: value || undefined }, { preserveState: true });
    }

    function handleReturn() {
        if (!returnTarget) return;
        router.post(`/staff/transactions/${returnTarget.id}/return`, { return_condition_notes: notes }, {
            onSuccess: () => {
                setReturnTarget(null);
                setNotes('');
            }
        });
    }

    return (
        <StaffLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader title="Transactions" description="Track loans and process returns." />

                <div className="flex flex-wrap items-center gap-2">
                    <Select value={filters.status ?? 'all'} onValueChange={(v) => handleFilterChange('status', v === 'all' ? '' : v)}>
                        <SelectTrigger className="h-9 w-[150px] text-sm">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card className="overflow-hidden p-0">
                    <DataTable
                        columns={[
                            {
                                key: 'borrower',
                                label: 'Borrower',
                                width: '25%',
                                render: (t) => <span className="font-medium text-foreground truncate block">{t.borrower.name}</span>,
                            },
                            {
                                key: 'equipment',
                                label: 'Equipment',
                                width: '25%',
                                render: (t) => <span className="text-muted-foreground truncate block">{t.equipment.name}</span>,
                            },
                            {
                                key: 'due',
                                label: 'Due Date',
                                width: '15%',
                                render: (t) => <span className="text-muted-foreground text-xs">{t.due_date}</span>,
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                width: '11%',
                                align: 'center',
                                render: (t) => <StatusBadge status={t.status} />,
                            },
                            {
                                key: 'actions',
                                label: '',
                                width: '10%',
                                align: 'right',
                                render: (t) => (
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="size-7" asChild>
                                            <Link href={`/staff/transactions/${t.id}`}><Eye className="size-3.5" /></Link>
                                        </Button>
                                        {t.status !== 'returned' && (
                                            <Button variant="ghost" size="icon" className="size-7 text-primary" onClick={() => setReturnTarget(t)}><RotateCcw className="size-3.5" /></Button>
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

                <Dialog open={!!returnTarget} onOpenChange={() => setReturnTarget(null)}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Mark as Returned</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-2">
                            <p className="text-sm text-muted-foreground"><strong>{returnTarget?.borrower.name}</strong> returning <strong>{returnTarget?.equipment.name}</strong>.</p>
                            <div className="space-y-1.5">
                                <Label>Condition Notes</Label>
                                <Input placeholder="Any notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setReturnTarget(null)}>Cancel</Button>
                            <Button onClick={handleReturn}>Confirm Return</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </StaffLayout>
    );
}
