import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useState } from 'react';
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Promo Codes</h1>
                        <p className="text-sm text-muted-foreground">
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

                <Card>
                    <CardContent className="pt-4">
                        <div className="overflow-x-auto">
                            <table className="table table-sm w-full">
                                <thead>
                                    <tr className="text-muted-foreground">
                                        <th>Code</th>
                                        <th>Discount</th>
                                        <th>Plan</th>
                                        <th>Usage</th>
                                        <th>Expires</th>
                                        <th>Active</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {promoCodes.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                                No promo codes yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        promoCodes.data.map((code) => (
                                            <tr key={code.id} className="hover">
                                                <td>
                                                    <span className="font-mono font-semibold">{code.code}</span>
                                                    {code.description && (
                                                        <div className="text-xs text-muted-foreground">{code.description}</div>
                                                    )}
                                                </td>
                                                <td>
                                                    {code.discount_type === 'percentage'
                                                        ? `${code.discount_value}%`
                                                        : `₱${code.discount_value}`}
                                                </td>
                                                <td className="capitalize">{code.applicable_plan ? code.applicable_plan : 'All'}</td>
                                                <td>
                                                    {code.times_used} / {code.max_uses ?? '∞'}
                                                </td>
                                                <td className="text-xs text-muted-foreground">
                                                    {code.expires_at
                                                        ? new Date(code.expires_at).toLocaleDateString()
                                                        : 'Never'}
                                                </td>
                                                <td>
                                                    {code.is_active
                                                        ? <CheckCircle className="size-4 text-green-500" />
                                                        : <XCircle className="size-4 text-destructive" />}
                                                </td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <Link href={`/super-admin/promo-codes/${code.id}/edit`}>
                                                            <Button variant="ghost" size="icon">
                                                                <Pencil className="size-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setDeleteTarget(code)}
                                                        >
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete "{deleteTarget?.code}"?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        This promo code will be permanently deleted. This cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SuperAdminLayout>
    );
}