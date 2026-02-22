import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
    transactions: { data: Transaction[]; current_page: number; last_page: number; next_page_url: string | null; prev_page_url: string | null };
    filters: { status?: string };
}

const statusBadge: Record<string, string> = {
    active: 'badge-info',
    returned: 'badge-success',
    overdue: 'badge-error',
};

export default function StaffTransactionsIndex({ transactions, filters }: Props) {
    const [returnTarget, setReturnTarget] = useState<Transaction | null>(null);
    const [notes, setNotes] = useState('');

    function handleReturn() {
        if (!returnTarget) return;
        router.post(`/staff/transactions/${returnTarget.id}/return`, { return_condition_notes: notes }, {
            onSuccess: () => { setReturnTarget(null); setNotes(''); },
        });
    }

    return (
        <StaffLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Transactions</h1>
                    <div className="flex gap-2">
                        {['', 'active', 'overdue', 'returned'].map((s) => (
                            <Button key={s} size="sm"
                                variant={filters.status === s || (!filters.status && s === '') ? 'default' : 'outline'}
                                onClick={() => router.get('/staff/transactions', { status: s }, { preserveState: true })}>
                                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-4">
                        <div className="overflow-x-auto">
                            <table className="table table-sm w-full">
                                <thead>
                                    <tr className="text-muted-foreground"><th>Borrower</th><th>Equipment</th><th>Due</th><th>Status</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {transactions.data.length === 0 ? (
                                        <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No transactions.</td></tr>
                                    ) : transactions.data.map((t) => (
                                        <tr key={t.id} className="hover">
                                            <td className="font-medium">{t.borrower.name}</td>
                                            <td>{t.equipment.name}</td>
                                            <td className="text-xs">{new Date(t.due_date).toLocaleString()}</td>
                                            <td><span className={`badge badge-sm capitalize ${statusBadge[t.status]}`}>{t.status}</span></td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <Link href={`/staff/transactions/${t.id}`}><Button variant="ghost" size="icon"><Eye className="size-4" /></Button></Link>
                                                    {t.status !== 'returned' && (
                                                        <Button variant="ghost" size="icon" onClick={() => setReturnTarget(t)}>
                                                            <RotateCcw className="size-4 text-primary" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {transactions.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-2">
                                {transactions.prev_page_url && <Link href={transactions.prev_page_url}><Button variant="outline" size="sm">Previous</Button></Link>}
                                <span className="flex items-center text-sm text-muted-foreground">Page {transactions.current_page} of {transactions.last_page}</span>
                                {transactions.next_page_url && <Link href={transactions.next_page_url}><Button variant="outline" size="sm">Next</Button></Link>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!returnTarget} onOpenChange={() => setReturnTarget(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Mark as Returned</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground"><strong>{returnTarget?.borrower.name}</strong> returning <strong>{returnTarget?.equipment.name}</strong>.</p>
                    <div className="space-y-1">
                        <Label>Condition Notes</Label>
                        <Input placeholder="Any damage or notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReturnTarget(null)}>Cancel</Button>
                        <Button onClick={handleReturn}>Confirm Return</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StaffLayout>
    );
}