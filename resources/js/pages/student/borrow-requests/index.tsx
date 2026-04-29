import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, Plus, XCircle } from 'lucide-react';
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
import StudentLayout from '@/layouts/StudentLayout';
import { formatDate } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/student/dashboard' },
    { title: 'My Requests', href: '/student/borrow-requests' },
];

interface BorrowRequest {
    id: number;
    equipment: { name: string };
    borrow_date: string;
    expected_return_date: string;
    status: string;
    purpose: string;
}

interface Props {
    requests: {
        data: BorrowRequest[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
}

export default function StudentRequestsIndex({ requests }: Props) {
    const [cancelTarget, setCancelTarget] = useState<BorrowRequest | null>(
        null,
    );

    function handleCancel() {
        if (!cancelTarget) return;
        router.post(
            `/student/borrow-requests/${cancelTarget.id}/cancel`,
            {},
            { onSuccess: () => setCancelTarget(null) },
        );
    }

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="My Requests" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="My Requests"
                    description="Track your borrow requests."
                    actions={
                        <Button size="sm" asChild>
                            <Link href="/student/borrow-requests/create">
                                <Plus className="mr-1.5 size-3.5" />
                                New Request
                            </Link>
                        </Button>
                    }
                />

                <Card className="overflow-hidden p-0">
                    <DataTable
                        columns={[
                            {
                                key: 'equipment',
                                label: 'Equipment',
                                width: '35%',
                                render: (r) => (
                                    <span className="font-medium text-foreground">
                                        {r.equipment.name}
                                    </span>
                                ),
                            },
                            {
                                key: 'purpose',
                                label: 'Purpose',
                                width: '25%',
                                hideOnMobile: true,
                                render: (r) => (
                                    <span className="block truncate text-muted-foreground">
                                        {r.purpose}
                                    </span>
                                ),
                            },
                            {
                                key: 'borrow_date',
                                label: 'Borrow Date',
                                width: '15%',
                                hideOnMobile: true,
                                render: (r) => (
                                    <span className="text-xs">
                                        {formatDate(r.borrow_date)}
                                    </span>
                                ),
                            },
                            {
                                key: 'return_date',
                                label: 'Return Date',
                                width: '15%',
                                hideOnMobile: true,
                                render: (r) => (
                                    <span className="text-xs">
                                        {formatDate(r.expected_return_date)}
                                    </span>
                                ),
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                width: '10%',
                                align: 'center',
                                render: (r) => (
                                    <StatusBadge status={r.status} />
                                ),
                            },
                            {
                                key: 'actions',
                                label: '',
                                width: '8%',
                                align: 'right',
                                render: (r) => (
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7"
                                            asChild
                                        >
                                            <Link
                                                href={`/student/borrow-requests/${r.id}`}
                                            >
                                                <Eye className="size-3.5" />
                                            </Link>
                                        </Button>
                                        {r.status === 'pending' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7 hover:text-destructive"
                                                onClick={() =>
                                                    setCancelTarget(r)
                                                }
                                            >
                                                <XCircle className="size-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        data={requests.data}
                        keyExtractor={(r) => r.id}
                        mobileCards={true}
                    />
                    <TablePagination
                        currentPage={requests.current_page}
                        lastPage={requests.last_page}
                        nextUrl={requests.next_page_url}
                        prevUrl={requests.prev_page_url}
                    />
                </Card>

                <Dialog
                    open={!!cancelTarget}
                    onOpenChange={() => setCancelTarget(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cancel Request?</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to cancel this request?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setCancelTarget(null)}
                            >
                                No
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleCancel}
                            >
                                Yes, Cancel
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </StudentLayout>
    );
}
