import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
    equipment: {
        name: string;
        brand: string | null;
        model: string | null;
        category: { name: string } | null;
    };
    processedBy: { name: string } | null;
}

interface Props {
    borrowRequest: BorrowRequest;
}

export default function RequestShow({ borrowRequest: r }: Props) {
    const { can } = usePage().props;
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

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title={`Request #${r.id}`}
                    description={`Submitted on ${r.borrow_date}`}
                    actions={
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/requests">
                                    <ArrowLeft className="size-3.5 mr-1.5" /> Back
                                </Link>
                            </Button>
                            {can.approve_requests && r.status === 'pending' && (
                                <>
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setApproveOpen(true)}>
                                        <CheckCircle className="size-3.5 mr-1.5" /> Approve
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => setRejectOpen(true)}>
                                        <XCircle className="size-3.5 mr-1.5" /> Reject
                                    </Button>
                                </>
                            )}
                        </div>
                    }
                />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-3">
                                    {[
                                        ['Requester', r.requester.name],
                                        ['Equipment', r.equipment.name],
                                        ['Purpose', r.purpose],
                                        ['Borrow Date', r.borrow_date],
                                        ['Return Date', r.expected_return_date],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                                            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground w-32 shrink-0">
                                                {label}
                                            </dt>
                                            <dd className="text-sm text-foreground text-right">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </CardContent>
                        </Card>

                        {r.remarks && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Admin Remarks</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground whitespace-pre-wrap">{r.remarks}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <StatusBadge status={r.status} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">User Contact</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm font-medium">{r.requester.name}</div>
                                <div className="text-xs text-muted-foreground">{r.requester.email}</div>
                            </CardContent>
                        </Card>

                        {r.processedBy && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Timeline</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs">
                                        <div className="font-medium">Processed by {r.processedBy.name}</div>
                                        <div className="text-muted-foreground">{r.processed_at}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Dialogs */}
                <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Approve Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <p className="text-sm text-muted-foreground">
                                You are approving <strong>{r.requester.name}</strong>'s request.
                            </p>
                            <Input placeholder="Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setApproveOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">
                                Approve
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <p className="text-sm text-muted-foreground">Please provide a reason for rejection.</p>
                            <Input placeholder="Reason (required)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRejectOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleReject} disabled={!remarks}>
                                Reject
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </AdminLayout>
    );
}
