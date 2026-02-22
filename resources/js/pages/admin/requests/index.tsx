import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Requests', href: '/admin/requests' },
];

interface BorrowRequest {
    id: number;
    requester: { name: string };
    equipment: { name: string };
    borrow_date: string;
    expected_return_date: string;
    status: string;
    purpose: string;
}

interface Props {
    requests: { data: BorrowRequest[]; current_page: number; last_page: number; next_page_url: string | null; prev_page_url: string | null };
    filters: { status?: string; search?: string };
}

const statusBadge: Record<string, string> = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-error',
    canceled: 'badge-neutral',
};

export default function RequestsIndex({ requests, filters }: Props) {
    const [approveTarget, setApproveTarget] = useState<BorrowRequest | null>(null);
    const [rejectTarget, setRejectTarget] = useState<BorrowRequest | null>(null);
    const [remarks, setRemarks] = useState('');

    function handleApprove() {
        if (!approveTarget) return;
        router.post(`/admin/requests/${approveTarget.id}/approve`, { remarks }, {
            onSuccess: () => { setApproveTarget(null); setRemarks(''); },
        });
    }

    function handleReject() {
        if (!rejectTarget) return;
        router.post(`/admin/requests/${rejectTarget.id}/reject`, { remarks }, {
            onSuccess: () => { setRejectTarget(null); setRemarks(''); },
        });
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Borrow Requests" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Borrow Requests</h1>
                        <p className="text-sm text-muted-foreground">Review and process student borrow requests.</p>
                    </div>
                    {/* Status Filter */}
                    <div className="flex gap-2">
                        {['', 'pending', 'approved', 'rejected'].map((s) => (
                            <Button
                                key={s}
                                variant={filters.status === s || (!filters.status && s === '') ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get('/admin/requests', { status: s }, { preserveState: true })}
                            >
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
                                    <tr className="text-muted-foreground">
                                        <th>Student</th>
                                        <th>Equipment</th>
                                        <th>Borrow Date</th>
                                        <th>Return Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.data.length === 0 ? (
                                        <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No requests found.</td></tr>
                                    ) : (
                                        requests.data.map((r) => (
                                            <tr key={r.id} className="hover">
                                                <td className="font-medium">{r.requester.name}</td>
                                                <td>{r.equipment.name}</td>
                                                <td className="text-xs">{new Date(r.borrow_date).toLocaleString()}</td>
                                                <td className="text-xs">{new Date(r.expected_return_date).toLocaleString()}</td>
                                                <td><span className={`badge badge-sm capitalize ${statusBadge[r.status]}`}>{r.status}</span></td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <Link href={`/admin/requests/${r.id}`}>
                                                            <Button variant="ghost" size="icon"><Eye className="size-4" /></Button>
                                                        </Link>
                                                        {r.status === 'pending' && (
                                                            <>
                                                                <Button variant="ghost" size="icon" onClick={() => setApproveTarget(r)}>
                                                                    <CheckCircle className="size-4 text-green-500" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onClick={() => setRejectTarget(r)}>
                                                                    <XCircle className="size-4 text-destructive" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {requests.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-2">
                                {requests.prev_page_url && <Link href={requests.prev_page_url}><Button variant="outline" size="sm">Previous</Button></Link>}
                                <span className="flex items-center text-sm text-muted-foreground">Page {requests.current_page} of {requests.last_page}</span>
                                {requests.next_page_url && <Link href={requests.next_page_url}><Button variant="outline" size="sm">Next</Button></Link>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Approve Dialog */}
            <Dialog open={!!approveTarget} onOpenChange={() => setApproveTarget(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Approve Request</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Approving <strong>{approveTarget?.requester.name}</strong>'s request for <strong>{approveTarget?.equipment.name}</strong>.
                    </p>
                    <Input placeholder="Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveTarget(null)}>Cancel</Button>
                        <Button onClick={handleApprove}>Approve</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Reject Request</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Rejecting <strong>{rejectTarget?.requester.name}</strong>'s request for <strong>{rejectTarget?.equipment.name}</strong>.
                    </p>
                    <Input placeholder="Reason for rejection (required)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!remarks}>Reject</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}