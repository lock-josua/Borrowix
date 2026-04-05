import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Tag } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Promo Codes
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage discount codes for school subscriptions.
                        </p>
                    </div>
                    <Link href="/super-admin/promo-codes/create">
                        <Button>
                            <Plus className="mr-2 size-4" />
                            New Code
                        </Button>
                    </Link>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {promoCodes.data.length} code
                            {promoCodes.data.length !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {promoCodes.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Tag className="mb-3 size-10 text-muted-foreground/40" />
                                <p className="font-medium text-muted-foreground">
                                    No promo codes yet
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Create your first discount code for schools.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Code
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Discount
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Plan
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Usage
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Expires
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Active
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {promoCodes.data.map((code) => (
                                            <tr
                                                key={code.id}
                                                className="border-b transition-colors last:border-0 hover:bg-muted/50"
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
                                                <td className="px-4 py-3 text-sm font-medium">
                                                    {code.discount_type ===
                                                    'percentage'
                                                        ? `${code.discount_value}%`
                                                        : `₱${code.discount_value}`}
                                                </td>
                                                <td className="px-4 py-3 text-sm capitalize">
                                                    {code.applicable_plan ??
                                                        'All'}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
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
                                                <td className="px-4 py-3">
                                                    {code.is_active ? (
                                                        <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                                                            <CheckCircle className="size-4" />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                                            <XCircle className="size-4" />
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        <Link
                                                            href={`/super-admin/promo-codes/${code.id}/edit`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                <Pencil className="mr-1 size-3.5" />
                                                                Edit
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() =>
                                                                setDeleteTarget(
                                                                    code,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="mr-1 size-3.5" />
                                                            Delete
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
            </div>

            {/* Delete Confirm Dialog */}
            <Dialog
                open={!!deleteTarget}
                onOpenChange={() => setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Delete "{deleteTarget?.code}"?
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        This promo code will be permanently deleted. This cannot
                        be undone.
                    </p>
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
