import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

interface BorrowRequest {
    id: number;
    status: string;
    purpose: string;
    borrow_date: string;
    expected_return_date: string;
    remarks: string | null;
    processed_at: string | null;
    requester: { name: string; email: string };
    equipment: { name: string; brand: string | null; model: string | null; category: { name: string } | null };
    processedBy: { name: string } | null;
}

interface Props {
    borrowRequest: BorrowRequest;
}

const statusBadge: Record<string, string> = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-error',
    canceled: 'badge-neutral',
};

export default function RequestShow({ borrowRequest: r }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Requests', href: '/admin/requests' },
        { title: `Request #${r.id}`, href: `/admin/requests/${r.id}` },
    ];

    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [remarks, setRemarks] = useState('');

    function handleApprove() {
        router.post(`/admin/requests/${r.id}/approve`, { remarks }, { onSuccess: () => setApproveOpen(false) });
    }

    function handleReject() {
        router.post(`/admin/requests/${r.id}/reject`, { remarks }, { onSuccess: () => setRejectOpen(false) });
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Request #${r.id}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/requests"><Button variant="ghost" size="icon"><ArrowLeft className="size-4" /></Button></Link>
                        <div>
                            <h1 className="text-2xl font-bold">Request #{r.id}</h1>
                            <span className={`badge capitalize ${statusBadge[r.status]}`}>{r.status}</span>
                        </div>
                    </div>
                    {r.status === 'pending' && (
                        <div className="flex gap-2">
                            <Button onClick={() => setApproveOpen(true)}><CheckCircle className="mr-2 size-4" />Approve</Button>
                            <Button variant="destructive" onClick={() => setRejectOpen(true)}><XCircle className="mr-2 size-4" />Reject</Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Requester</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <InfoRow label="Name" value={r.requester.name} />
                            <InfoRow label="Email" value={r.requester.email} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Equipment</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <InfoRow label="Name" value={r.equipment.name} />
                            <InfoRow label="Category" value={r.equipment.category?.name ?? '—'} />
                            {r.equipment.brand && <InfoRow label="Brand" value={r.equipment.brand} />}
                            {r.equipment.model && <InfoRow label="Model" value={r.equipment.model} />}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Schedule</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <InfoRow label="Borrow Date" value={new Date(r.borrow_date).toLocaleString()} />
                            <InfoRow label="Return Date" value={new Date(r.expected_return_date).toLocaleString()} />
                            <InfoRow label="Purpose" value={r.purpose} />
                        </CardContent>
                    </Card>

                    {r.processedBy && (
                        <Card>
                            <CardHeader><CardTitle className="text-base">Processing Details</CardTitle></CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <InfoRow label="Processed By" value={r.processedBy.name} />
                                <InfoRow label="Processed At" value={new Date(r.processed_at!).toLocaleString()} />
                                {r.remarks && <InfoRow label="Remarks" value={r.remarks} />}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Approve Request</DialogTitle></DialogHeader>
                    <Input placeholder="Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveOpen(false)}>Cancel</Button>
                        <Button onClick={handleApprove}>Approve</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Reject Request</DialogTitle></DialogHeader>
                    <Input placeholder="Reason (required)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!remarks}>Reject</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
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