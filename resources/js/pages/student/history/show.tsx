import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Package, User } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StudentLayout from '@/layouts/StudentLayout';
import { formatDate } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Transaction {
    id: number;
    status: string;
    issued_at: string;
    due_date: string;
    returned_at: string | null;
    fine_amount: number;
    fine_reason: string | null;
    return_condition_notes: string | null;
    equipment: {
        name: string;
        brand: string | null;
        model: string | null;
        category: { name: string } | null;
    };
    issuedBy: { name: string } | null;
    returnedTo: { name: string } | null;
}

interface Props {
    transaction: Transaction;
}

export default function HistoryShow({ transaction: t }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Home', href: '/student/dashboard' },
        { title: 'My History', href: '/student/history' },
        { title: `Transaction #${t.id}`, href: `/student/history/${t.id}` },
    ];

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title={`Transaction #${t.id}`} />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title={`Transaction #${t.id}`}
                    description={`Details of your equipment borrow transaction.`}
                    actions={
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/student/history">
                                <ArrowLeft className="mr-1.5 size-3.5" /> Back
                            </Link>
                        </Button>
                    }
                />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                                <Package className="size-4 text-primary" />
                                <CardTitle className="text-sm font-semibold">
                                    Equipment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-3">
                                    {[
                                        ['Name', t.equipment.name],
                                        [
                                            'Category',
                                            t.equipment.category?.name ?? '—',
                                        ],
                                        ['Brand', t.equipment.brand ?? '—'],
                                        ['Model', t.equipment.model ?? '—'],
                                    ].map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="flex items-start justify-between border-b border-border/60 py-2 last:border-0"
                                        >
                                            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                {label}
                                            </dt>
                                            <dd className="text-right text-sm font-medium text-foreground">
                                                {value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </CardContent>
                        </Card>

                        {(t.fine_amount > 0 || t.return_condition_notes) && (
                            <Card className="border-destructive/20 bg-destructive/5">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold text-destructive">
                                        Return Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <dl className="space-y-3">
                                        {t.fine_amount > 0 && (
                                            <div className="flex items-start justify-between border-b border-destructive/10 py-2 last:border-0">
                                                <dt className="text-xs font-medium tracking-wide text-destructive/70 uppercase">
                                                    Fine Amount
                                                </dt>
                                                <dd className="text-right text-sm font-bold text-destructive">
                                                    ₱{t.fine_amount}
                                                </dd>
                                            </div>
                                        )}
                                        {t.return_condition_notes && (
                                            <div className="flex flex-col gap-1 py-2 last:border-0">
                                                <dt className="text-xs font-medium tracking-wide text-destructive/70 uppercase">
                                                    Return Notes
                                                </dt>
                                                <dd className="text-sm text-foreground">
                                                    {t.return_condition_notes}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold">
                                    Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <StatusBadge status={t.status} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
                                <Clock className="size-4 text-primary" />
                                <CardTitle className="text-sm font-semibold">
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5 py-4">
                                <div className="relative pl-6 before:absolute before:top-1 before:left-[7px] before:h-full before:w-[2px] before:bg-border last:before:hidden">
                                    <div className="absolute top-1.5 left-0 size-[16px] rounded-full border-2 border-background bg-primary shadow-sm" />
                                    <div className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                        Issued
                                    </div>
                                    <div className="text-sm font-medium">
                                        {formatDate(t.issued_at)}
                                    </div>
                                    {t.issuedBy && (
                                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <User className="size-3" />
                                            <span>By {t.issuedBy.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="relative pl-6 before:absolute before:top-1 before:left-[7px] before:h-full before:w-[2px] before:bg-border last:before:hidden">
                                    <div className="absolute top-1.5 left-0 size-[16px] rounded-full border-2 border-background bg-orange-500 shadow-sm" />
                                    <div className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                        Due Date
                                    </div>
                                    <div className="text-sm font-medium">
                                        {formatDate(t.due_date)}
                                    </div>
                                </div>

                                {t.returned_at && (
                                    <div className="relative pl-6">
                                        <div className="absolute top-1.5 left-0 size-[16px] rounded-full border-2 border-background bg-emerald-500 shadow-sm" />
                                        <div className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                            Returned
                                        </div>
                                        <div className="text-sm font-medium">
                                            {formatDate(t.returned_at)}
                                        </div>
                                        {t.returnedTo && (
                                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <User className="size-3" />
                                                <span>
                                                    To {t.returnedTo.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </StudentLayout>
    );
}
