import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Package, Pencil, Trash2, Search } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Equipment', href: '/admin/equipment' },
];

interface Equipment {
    id: number;
    name: string;
    brand: string | null;
    model: string | null;
    quantity: number;
    available_quantity: number;
    status: string;
    category: { name: string } | null;
    image: string | null;
}

interface Props {
    equipment: {
        data: Equipment[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    categories: { id: number; name: string }[];
    filters: { search?: string; category?: string; status?: string };
}

const statusBadge: Record<string, string> = {
    available: 'badge-success',
    borrowed: 'badge-warning',
    under_repair: 'badge-error',
    reserved: 'badge-info',
    retired: 'badge-neutral',
};

export default function EquipmentIndex({
    equipment,
    categories,
    filters,
}: Props) {
    const { can } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/admin/equipment', { search }, { preserveState: true });
    }

    function handleDelete() {
        if (!deleteTarget) return;
        router.delete(`/admin/equipment/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Equipment" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Equipment
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage your school's ICT equipment.
                        </p>
                    </div>
                    {can.manage_equipment && (
                        <Link href="/admin/equipment/create">
                            <Button>
                                <Plus className="mr-2 size-4" />
                                Add Equipment
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                placeholder="Search equipment..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-sm"
                            />
                            <Button type="submit" variant="outline" size="icon">
                                <Search className="size-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Equipment Grid */}
                {equipment.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Package className="mb-3 size-12 text-muted-foreground/30" />
                        <p className="font-medium text-muted-foreground">
                            No equipment found
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Try adjusting your search or add new equipment.
                        </p>
                        {can.manage_equipment && (
                            <Link
                                href="/admin/equipment/create"
                                className="mt-4"
                            >
                                <Button size="sm">
                                    <Plus className="mr-2 size-4" />
                                    Add Equipment
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {equipment.data.map((e) => (
                            <Card key={e.id} className="group overflow-hidden">
                                <div className="relative">
                                    {/* Image */}
                                    <div className="h-48 w-full overflow-hidden bg-muted">
                                        {e.image ? (
                                            <img
                                                src={e.image}
                                                alt={e.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/50">
                                                <Package className="size-10 text-muted-foreground/30" />
                                                <span className="text-xs text-muted-foreground">
                                                    No image
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Status Badge */}
                                    <div className="absolute top-2 left-2">
                                        <span
                                            className={`badge capitalize ${statusBadge[e.status]}`}
                                        >
                                            {e.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="size-8 shadow-sm"
                                            asChild
                                        >
                                            <Link
                                                href={`/admin/equipment/${e.id}/edit`}
                                            >
                                                <Pencil className="size-3.5" />
                                            </Link>
                                        </Button>
                                        {can.delete_equipment && (
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="size-8 shadow-sm"
                                                onClick={() =>
                                                    setDeleteTarget(e)
                                                }
                                            >
                                                <Trash2 className="size-3.5 text-destructive" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <Link
                                        href={`/admin/equipment/${e.id}`}
                                        className="line-clamp-1 font-medium hover:underline"
                                    >
                                        {e.name}
                                    </Link>
                                    {(e.brand || e.model) && (
                                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                            {[e.brand, e.model]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </p>
                                    )}
                                    {e.category && (
                                        <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                            {e.category.name}
                                        </span>
                                    )}
                                    <div className="mt-3 flex items-center justify-between border-t pt-2 text-xs">
                                        <span className="text-muted-foreground">
                                            Total: <strong>{e.quantity}</strong>
                                        </span>
                                        <span
                                            className={
                                                e.available_quantity > 0
                                                    ? 'font-medium text-emerald-600'
                                                    : 'font-medium text-destructive'
                                            }
                                        >
                                            {e.available_quantity} available
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {equipment.last_page > 1 && (
                    <div className="flex items-center justify-between pt-4">
                        <p className="text-xs text-muted-foreground">
                            Page {equipment.current_page} of{' '}
                            {equipment.last_page}
                        </p>
                        <div className="flex gap-2">
                            {equipment.prev_page_url && (
                                <Link href={equipment.prev_page_url}>
                                    <Button variant="outline" size="sm">
                                        ← Previous
                                    </Button>
                                </Link>
                            )}
                            {equipment.next_page_url && (
                                <Link href={equipment.next_page_url}>
                                    <Button variant="outline" size="sm">
                                        Next →
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Dialog
                open={!!deleteTarget}
                onOpenChange={() => setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Delete "{deleteTarget?.name}"?
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        This equipment will be permanently deleted.
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
        </AdminLayout>
    );
}
