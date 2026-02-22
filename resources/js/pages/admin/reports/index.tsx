import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Reports', href: '/admin/reports' },
];

interface Transaction {
    id: number;
    borrower: { name: string };
    equipment: { name: string };
    status: string;
    issued_at: string;
    returned_at: string | null;
    fine_amount: number;
}

interface Summary {
    total_transactions: number;
    returned: number;
    overdue: number;
    active: number;
}

interface Props {
    transactions: Transaction[];
    topEquipment: { equipment: { name: string }; total: number }[];
    topBorrowers: { borrower: { name: string; email: string }; total: number }[];
    summary: Summary;
    filters: { from: string; to: string };
}

const statusBadge: Record<string, string> = {
    active: 'badge-info',
    returned: 'badge-success',
    overdue: 'badge-error',
};

export default function ReportsIndex({ transactions, topEquipment, topBorrowers, summary, filters }: Props) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    function handleFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get('/admin/reports', { from, to }, { preserveState: true });
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />

            <div className="flex flex-col gap-6 p-6">
                <h1 className="text-2xl font-bold">Reports</h1>

                {/* Date Filter */}
                <Card>
                    <CardContent className="pt-4">
                        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
                            <div className="space-y-1">
                                <Label>From</Label>
                                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>To</Label>
                                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                            </div>
                            <Button type="submit">Apply</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Total', value: summary.total_transactions, cls: '' },
                        { label: 'Returned', value: summary.returned, cls: 'text-green-600' },
                        { label: 'Active', value: summary.active, cls: 'text-blue-600' },
                        { label: 'Overdue', value: summary.overdue, cls: 'text-destructive' },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="pt-4">
                                <div className={`text-3xl font-bold ${s.cls}`}>{s.value}</div>
                                <div className="text-sm text-muted-foreground">{s.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Top Equipment */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Most Borrowed Equipment</CardTitle></CardHeader>
                        <CardContent>
                            <table className="table table-sm w-full">
                                <thead><tr className="text-muted-foreground"><th>#</th><th>Equipment</th><th>Times</th></tr></thead>
                                <tbody>
                                    {topEquipment.length === 0 ? (
                                        <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">No data.</td></tr>
                                    ) : topEquipment.map((e, i) => (
                                        <tr key={i} className="hover">
                                            <td className="text-muted-foreground">{i + 1}</td>
                                            <td>{e.equipment?.name ?? '—'}</td>
                                            <td>{e.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Top Borrowers */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Most Active Borrowers</CardTitle></CardHeader>
                        <CardContent>
                            <table className="table table-sm w-full">
                                <thead><tr className="text-muted-foreground"><th>#</th><th>Student</th><th>Times</th></tr></thead>
                                <tbody>
                                    {topBorrowers.length === 0 ? (
                                        <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">No data.</td></tr>
                                    ) : topBorrowers.map((b, i) => (
                                        <tr key={i} className="hover">
                                            <td className="text-muted-foreground">{i + 1}</td>
                                            <td>
                                                <div className="font-medium">{b.borrower?.name ?? '—'}</div>
                                                <div className="text-xs text-muted-foreground">{b.borrower?.email}</div>
                                            </td>
                                            <td>{b.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                {/* Transaction Log */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Transaction Log</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="table table-sm w-full">
                                <thead>
                                    <tr className="text-muted-foreground">
                                        <th>Borrower</th>
                                        <th>Equipment</th>
                                        <th>Issued</th>
                                        <th>Returned</th>
                                        <th>Status</th>
                                        <th>Fine</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 ? (
                                        <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No transactions in this period.</td></tr>
                                    ) : transactions.map((t) => (
                                        <tr key={t.id} className="hover">
                                            <td>{t.borrower.name}</td>
                                            <td>{t.equipment.name}</td>
                                            <td className="text-xs">{new Date(t.issued_at).toLocaleString()}</td>
                                            <td className="text-xs">{t.returned_at ? new Date(t.returned_at).toLocaleString() : '—'}</td>
                                            <td><span className={`badge badge-sm capitalize ${statusBadge[t.status]}`}>{t.status}</span></td>
                                            <td>{t.fine_amount > 0 ? `₱${t.fine_amount}` : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}