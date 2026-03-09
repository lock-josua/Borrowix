import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Eye, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import StudentLayout from '@/layouts/StudentLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/student/dashboard' },
    { title: 'My Requests', href: '/student/borrow-requests' },
];

interface BorrowRequest {
    id: number;
    equipment: { name: string };
    borrow_date: string;
    expected_return_date: string;
    status: string;
}

interface Props {
    requests: { data: BorrowRequest[]; current_page: number; last_page: number; next_page_url: string | null; prev_page_url: string | null };
}

const statusBadge: Record<string, string> = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-error',
    canceled: 'badge-neutral',
};

export default function StudentRequestsIndex({ requests }: Props) {
    const [cancelTarget, setCancelTarget] = useState<BorrowRequest | null>(null);

    function handleCancel() {
        if (!cancelTarget) return;
        router.post(`/student/borrow-requests/${cancelTarget.id}/cancel`, {}, {
            onSuccess: () => setCancelTarget(null),
        });
    }

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="My Requests" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">My Requests</h1>
                    <Link href="/student/borrow-requests/create">
                        <Button><Plus className="mr-2 size-4" />New Request</Button>
                    </Link>
                </div>

                <Card>
                    <CardContent className="pt-4">
                        <div className="overflow-x-auto">
                            <table className="table table-sm w-full">
                                <thead>
                                    <tr className="text-muted-foreground"><th>Equipment</th><th>Borrow Date</th><th>Return Date</th><th>Status</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {requests.data.length === 0 ? (
                                        <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No requests yet. <Link href="/student/borrow-requests/create" className="text-primary underline">Make one!</Link></td></tr>
                                    ) : requests.data.map((r) => (
                                        <tr key={r.id} className="hover">
                                            <td className="font-medium">{r.equipment.name}</td>
                                            <td className="text-xs">{new Date(r.borrow_date).toLocaleString()}</td>
                                            <td className="text-xs">{new Date(r.expected_return_date).toLocaleString()}</td>
                                            <td><span className={`badge badge-sm capitalize ${statusBadge[r.status]}`}>{r.status}</span></td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <Link href={`/student/borrow-requests/${r.id}`}>
                                                        <Button variant="ghost" size="icon"><Eye className="size-4" /></Button>
                                                    </Link>
                                                    {r.status === 'pending' && (
                                                        <Button variant="ghost" size="icon" onClick={() => setCancelTarget(r)}>
                                                            <XCircle className="size-4 text-destructive" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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

            <Dialog open={!!cancelTarget} onOpenChange={() => setCancelTarget(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Cancel Request?</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Cancel your request for <strong>{cancelTarget?.equipment.name}</strong>?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelTarget(null)}>Keep</Button>
                        <Button variant="destructive" onClick={handleCancel}>Cancel Request</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StudentLayout>
    );
}