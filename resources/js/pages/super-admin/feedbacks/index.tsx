import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem, Feedback } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
    { title: 'Feedback & Support', href: '/super-admin/feedbacks' },
];

interface Props {
    feedbacks: {
        data: Feedback[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
}

export default function FeedbacksIndex({ feedbacks }: Props) {
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
        null,
    );
    const [status, setStatus] = useState<string>('');
    const [adminResponse, setAdminResponse] = useState<string>('');

    function handleUpdateStatus() {
        if (!selectedFeedback) return;
        router.post(
            `/super-admin/feedbacks/${selectedFeedback.id}`,
            {
                _method: 'PUT',
                status,
                admin_response: adminResponse,
            },
            {
                onSuccess: () => {
                    setSelectedFeedback(null);
                    setStatus('');
                    setAdminResponse('');
                },
            },
        );
    }

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Feedback & Support" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Feedback & Support"
                    description="View and manage bugs and concerns reported by tenant users."
                />

                <Card className="overflow-hidden border-border/60 p-0">
                    <DataTable
                        columns={[
                            {
                                key: 'tenant',
                                label: 'Tenant',
                                width: '15%',
                                render: (f) => (
                                    <span className="block truncate text-xs text-muted-foreground uppercase">
                                        {f.id ? `Tenant ${f.id}` : 'Central'}
                                    </span>
                                ),
                            },
                            {
                                key: 'reporter',
                                label: 'Reporter',
                                width: '20%',
                                render: (f) => (
                                    <div>
                                        <p className="truncate font-medium text-foreground">
                                            {/* @ts-expect-error - Backend returns user data */}
                                            {f.user_name ?? 'Unknown User'}
                                        </p>
                                        <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                            {/* @ts-expect-error - Backend returns user data */}
                                            {f.user_role ?? 'User'}
                                        </span>
                                    </div>
                                ),
                            },
                            {
                                key: 'type',
                                label: 'Type',
                                width: '10%',
                                align: 'center',
                                render: (f) => (
                                    <Badge
                                        variant={
                                            f.type === 'bug'
                                                ? 'destructive'
                                                : 'secondary'
                                        }
                                        className="capitalize"
                                    >
                                        {f.type}
                                    </Badge>
                                ),
                            },
                            {
                                key: 'title',
                                label: 'Title',
                                width: '25%',
                                render: (f) => (
                                    <div className="flex flex-col gap-1">
                                        <span className="block truncate font-medium">
                                            {f.title}
                                        </span>
                                        {f.admin_response && (
                                            <Badge
                                                variant="outline"
                                                className="w-fit scale-90 px-1 py-0 text-[10px] text-green-600"
                                            >
                                                Responded
                                            </Badge>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                width: '10%',
                                align: 'center',
                                render: (f) => {
                                    const variants: Record<
                                        string,
                                        | 'default'
                                        | 'secondary'
                                        | 'destructive'
                                        | 'outline'
                                    > = {
                                        open: 'destructive',
                                        pending: 'destructive',
                                        in_progress: 'secondary',
                                        reviewed: 'secondary',
                                        resolved: 'default',
                                        closed: 'outline',
                                    };
                                    return (
                                        <Badge
                                            variant={
                                                variants[f.status] || 'outline'
                                            }
                                            className="capitalize"
                                        >
                                            {f.status.replace('_', ' ')}
                                        </Badge>
                                    );
                                },
                            },
                            {
                                key: 'created',
                                label: 'Date',
                                width: '10%',
                                render: (f) => (
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(
                                            f.created_at,
                                        ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                ),
                            },
                            {
                                key: 'actions',
                                label: '',
                                width: '10%',
                                align: 'right',
                                render: (f) => (
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedFeedback(f);
                                                setStatus(f.status);
                                                setAdminResponse(
                                                    f.admin_response ?? '',
                                                );
                                            }}
                                        >
                                            View
                                        </Button>
                                    </div>
                                ),
                            },
                        ]}
                        data={feedbacks.data}
                        keyExtractor={(f) => f.id.toString()}
                    />
                    <TablePagination
                        currentPage={feedbacks.current_page}
                        lastPage={feedbacks.last_page}
                        nextUrl={feedbacks.next_page_url}
                        prevUrl={feedbacks.prev_page_url}
                    />
                </Card>

                <Dialog
                    open={!!selectedFeedback}
                    onOpenChange={(isOpen) =>
                        !isOpen && setSelectedFeedback(null)
                    }
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedFeedback?.title}</DialogTitle>
                            <DialogDescription>
                                Reported on{' '}
                                {selectedFeedback
                                    ? new Date(
                                          selectedFeedback.created_at,
                                      ).toLocaleDateString('en-US', {
                                          month: 'long',
                                          day: 'numeric',
                                          year: 'numeric',
                                      })
                                    : ''}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="rounded-md bg-muted/50 p-4 text-sm whitespace-pre-wrap">
                                {selectedFeedback?.description}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Update Status
                                </label>
                                <Select
                                    value={status}
                                    onValueChange={setStatus}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="reviewed">
                                            Reviewed
                                        </SelectItem>
                                        <SelectItem value="resolved">
                                            Resolved
                                        </SelectItem>
                                        <SelectItem value="closed">
                                            Closed
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-sm font-medium">
                                    Admin Response
                                </label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Write your response to the user here..."
                                    value={adminResponse}
                                    onChange={(e) =>
                                        setAdminResponse(e.target.value)
                                    }
                                />
                                {selectedFeedback?.responded_at && (
                                    <p className="text-[10px] text-muted-foreground">
                                        Last responded on{' '}
                                        {new Date(
                                            selectedFeedback.responded_at,
                                        ).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedFeedback(null)}
                            >
                                Close
                            </Button>
                            <Button
                                onClick={handleUpdateStatus}
                                disabled={
                                    status === selectedFeedback?.status &&
                                    adminResponse ===
                                        (selectedFeedback?.admin_response ?? '')
                                }
                            >
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </SuperAdminLayout>
    );
}
