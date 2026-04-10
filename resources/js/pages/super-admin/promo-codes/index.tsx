import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CheckCircle, Pencil, Plus, Tag, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
    { title: 'Promo Codes', href: '/super-admin/promo-codes' },
];

interface PromoCode {
    id: number;
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    applicable_plan: string | null;
    max_uses: number | null;
    times_used: number;
    is_active: boolean;
    expires_at: string | null;
}

interface Props {
    promoCodes: { data: PromoCode[] };
}

export default function PromoCodesIndex({ promoCodes }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<PromoCode | null>(null);

    function handleDelete() {
        if (!deleteTarget) return;
        router.delete(`/super-admin/promo-codes/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Promo Codes" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Promo Codes"
                    description="Manage discount codes for school subscriptions."
                    actions={
                        <Button asChild size="sm" className="gap-1.5">
                            <Link href="/super-admin/promo-codes/create">
                                <Plus className="size-3.5" /> New Code
                            </Link>
                        </Button>
                    }
                />

                <Card className="overflow-hidden border-border/60 p-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border px-4 py-3">
                        <CardTitle className="text-sm font-semibold">
                            {promoCodes.data.length} code
                            {promoCodes.data.length !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {promoCodes.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 rounded-full bg-muted p-4">
                                    <Tag className="size-8 text-muted-foreground" />
                                </div>
                                <h3 className="mb-1 text-base font-semibold text-foreground">
                                    No promo codes yet
                                </h3>
                                <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                                    Create your first discount code for schools.
                                </p>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/super-admin/promo-codes/create">
                                        <Plus className="mr-1.5 size-3.5" />
                                        Create Code
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30 hover:bg-muted/30">
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Code
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Discount
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Plan
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Usage
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Expires
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Active
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {promoCodes.data.map((code) => (
                                            <tr
                                                key={code.id}
                                                className="border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                                            >
                                                <td className="px-4 py-3">
                                                    <code className="rounded bg-muted px-2 py-0.5 font-mono text-sm font-semibold tracking-wide">
                                                        {code.code}
                                                    </code>
                                                    {code.description && (
                                                        <div className="mt-0.5 text-xs text-muted-foreground">
                                                            {code.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-foreground">
                                                    {code.discount_type ===
                                                    'percentage'
                                                        ? `${code.discount_value}%`
                                                        : `₱${code.discount_value}`}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                                                    {code.applicable_plan ??
                                                        'All'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                    {code.times_used} /{' '}
                                                    {code.max_uses ?? '∞'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {code.expires_at
                                                        ? new Date(
                                                              code.expires_at,
                                                          ).toLocaleDateString()
                                                        : 'Never'}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {code.is_active ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                            <CheckCircle className="size-3.5" />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                                            <XCircle className="size-3.5" />
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7"
                                                            aria-label="Edit promo code"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/super-admin/promo-codes/${code.id}/edit`}
                                                            >
                                                                <Pencil className="size-3.5" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7 hover:text-destructive"
                                                            aria-label="Delete promo code"
                                                            onClick={() =>
                                                                setDeleteTarget(
                                                                    code,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            <Dialog
                open={!!deleteTarget}
                onOpenChange={() => setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Delete "{deleteTarget?.code}"?
                        </DialogTitle>
                        <DialogDescription>
                            This promo code will be permanently deleted. This
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SuperAdminLayout>
    );
}
