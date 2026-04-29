import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ExternalLink,
    Eye,
    Plus,
    Search,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { formatDateOnly } from '@/lib/utils';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
    { title: 'Schools', href: '/super-admin/schools' },
];

interface School {
    id: string;
    name: string;
    email: string;
    plan: string;
    subscription_status?: string;
    status: string;
    school_url: string | null;
    created_at: string;
}

interface Props {
    schools: {
        data: School[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    filters: { search?: string; plan?: string };
}

export default function SchoolsIndex({ schools, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [suspendTarget, setSuspendTarget] = useState<School | null>(null);
    const [reason, setReason] = useState('');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(
            '/super-admin/schools',
            { ...filters, search },
            { preserveState: true },
        );
    }

    function handleFilterChange(key: string, value: string) {
        router.get(
            '/super-admin/schools',
            { ...filters, [key]: value || undefined },
            { preserveState: true },
        );
    }

    function handleSuspend() {
        if (!suspendTarget) return;
        router.post(
            `/super-admin/schools/${suspendTarget.id}/suspend`,
            { reason },
            {
                onSuccess: () => {
                    setSuspendTarget(null);
                    setReason('');
                },
            },
        );
    }

    function handleReactivate(school: School) {
        router.post(`/super-admin/schools/${school.id}/reactivate`);
    }

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Schools" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Schools"
                    description="All registered schools on Borrowix."
                    actions={
                        <Button asChild size="sm" className="gap-1.5">
                            <Link href="/super-admin/schools/create">
                                <Plus className="size-3.5" /> Add School
                            </Link>
                        </Button>
                    }
                />

                {/* Filter bar */}
                <Card className="flex flex-row flex-wrap items-center gap-2 p-3 py-3">
                    <form
                        onSubmit={handleSearch}
                        className="relative max-w-xs min-w-[220px] flex-1"
                    >
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="h-9 bg-muted/20 pl-8 text-sm"
                            placeholder="Search school or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                    <Select
                        value={filters.plan ?? 'all'}
                        onValueChange={(v) =>
                            handleFilterChange('plan', v === 'all' ? '' : v)
                        }
                    >
                        <SelectTrigger className="h-9 w-[180px] bg-muted/20 text-sm">
                            <SelectValue placeholder="Subscription" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                All Subscriptions
                            </SelectItem>
                            <SelectItem value="trialing">Trialing</SelectItem>
                            <SelectItem value="subscribed">
                                Subscribed
                            </SelectItem>
                            <SelectItem value="trial_expired">
                                Trial Expired
                            </SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                </Card>

                <Card className="overflow-hidden border-border/60 p-0">
                    <DataTable
                        columns={[
                            {
                                key: 'name',
                                label: 'School',
                                width: '28%',
                                render: (s) => (
                                    <div>
                                        <p className="truncate font-medium text-foreground">
                                            {s.name}
                                        </p>
                                        {s.school_url && (
                                            <a
                                                href={s.school_url}
                                                target="_blank"
                                                className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                                            >
                                                <ExternalLink className="size-2.5" />{' '}
                                                Portal
                                            </a>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: 'email',
                                label: 'Email',
                                width: '25%',
                                render: (s) => (
                                    <span className="block truncate text-muted-foreground">
                                        {s.email}
                                    </span>
                                ),
                            },
                            {
                                key: 'plan',
                                label: 'Subscription',
                                width: '15%',
                                align: 'center',
                                render: (s) => (
                                    <StatusBadge
                                        status={
                                            s.subscription_status ?? 'trialing'
                                        }
                                    />
                                ),
                            },
                            {
                                key: 'status',
                                label: 'Tenant',
                                width: '12%',
                                align: 'center',
                                render: (s) => (
                                    <StatusBadge status={s.status} />
                                ),
                            },
                            {
                                key: 'created',
                                label: 'Created',
                                width: '13%',
                                render: (s) => (
                                    <span className="text-xs text-muted-foreground">
                                        {formatDateOnly(s.created_at)}
                                    </span>
                                ),
                            },
                            {
                                key: 'actions',
                                label: '',
                                width: '10%',
                                align: 'right',
                                render: (s) => (
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7"
                                            aria-label="View school"
                                            asChild
                                        >
                                            <Link
                                                href={`/super-admin/schools/${s.id}`}
                                            >
                                                <Eye className="size-3.5" />
                                            </Link>
                                        </Button>
                                        {s.status === 'active' ? (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7 hover:text-destructive"
                                                aria-label="Suspend school"
                                                onClick={() =>
                                                    setSuspendTarget(s)
                                                }
                                            >
                                                <ShieldAlert className="size-3.5" />
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7 text-emerald-600"
                                                aria-label="Reactivate school"
                                                onClick={() =>
                                                    handleReactivate(s)
                                                }
                                            >
                                                <ShieldCheck className="size-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        data={schools.data}
                        keyExtractor={(s) => s.id}
                    />
                    <TablePagination
                        currentPage={schools.current_page}
                        lastPage={schools.last_page}
                        nextUrl={schools.next_page_url}
                        prevUrl={schools.prev_page_url}
                    />
                </Card>

                <Dialog
                    open={!!suspendTarget}
                    onOpenChange={() => setSuspendTarget(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Suspend School?</DialogTitle>
                            <DialogDescription>
                                This will disable access for all users of this
                                school.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <Input
                                placeholder="Reason for suspension"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setSuspendTarget(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleSuspend}
                                disabled={!reason}
                            >
                                Suspend
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </SuperAdminLayout>
    );
}
