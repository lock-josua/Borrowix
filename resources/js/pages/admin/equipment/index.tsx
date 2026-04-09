import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    can: {
        manage_equipment: boolean;
        delete_equipment: boolean;
    };
}

export default function EquipmentIndex({ equipment, categories, filters, can }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/admin/equipment', { ...filters, search }, { preserveState: true });
    }

    function handleFilterChange(key: string, value: string) {
        router.get('/admin/equipment', { ...filters, [key]: value || undefined }, { preserveState: true });
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

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Equipment"
                    description="Manage all ICT equipment inventory"
                    actions={
                        can.manage_equipment && (
                            <Button asChild size="sm" className="gap-1.5">
                                <Link href="/admin/equipment/create">
                                    <Plus className="size-3.5" />
                                    Add Equipment
                                </Link>
                            </Button>
                        )
                    }
                />

                {/* Filter bar */}
                <Card className="flex flex-row flex-wrap items-center gap-2 p-3 py-3">
                    <form onSubmit={handleSearch} className="relative min-w-[220px] flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                            className="pl-8 h-9 text-sm bg-muted/20"
                            placeholder="Search equipment..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                    <Select value={filters.category ?? 'all'} onValueChange={(v) => handleFilterChange('category', v === 'all' ? '' : v)}>
                        <SelectTrigger className="h-9 w-[150px] text-sm bg-muted/20">
                            <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            {categories.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filters.status ?? 'all'} onValueChange={(v) => handleFilterChange('status', v === 'all' ? '' : v)}>
                        <SelectTrigger className="h-9 w-[140px] text-sm bg-muted/20">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="borrowed">Borrowed</SelectItem>
                            <SelectItem value="under_repair">Under Repair</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                        </SelectContent>
                    </Select>
                </Card>

                {/* Table */}
                <Card className="overflow-hidden p-0 border-border/60">
                    <DataTable
                        columns={[
                            {
                                key: 'name',
                                label: 'Name',
                                width: '28%',
                                render: (item) => (
                                    <div>
                                        <p className="font-medium text-foreground truncate">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.available_quantity}/{item.quantity} available
                                        </p>
                                    </div>
                                ),
                            },
                            {
                                key: 'category',
                                label: 'Category',
                                width: '16%',
                                render: (item) => <span className="text-muted-foreground text-xs truncate block">{item.category?.name ?? '—'}</span>,
                            },
                            {
                                key: 'brand',
                                label: 'Brand/Model',
                                width: '18%',
                                render: (item) => (
                                    <span className="text-muted-foreground text-xs truncate block">
                                        {[item.brand, item.model].filter(Boolean).join(' · ') || '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'qty',
                                label: 'Qty',
                                width: '9%',
                                align: 'center',
                                render: (item) => <span className="font-medium">{item.quantity}</span>,
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                width: '14%',
                                align: 'center',
                                render: (item) => <StatusBadge status={item.status} />,
                            },
                            {
                                key: 'actions',
                                label: '',
                                width: '15%',
                                align: 'right',
                                render: (item) => (
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="size-7" asChild>
                                            <Link href={`/admin/equipment/${item.id}`}>
                                                <Eye className="size-3.5" />
                                            </Link>
                                        </Button>
                                        {can.manage_equipment && (
                                            <Button variant="ghost" size="icon" className="size-7" asChild>
                                                <Link href={`/admin/equipment/${item.id}/edit`}>
                                                    <Pencil className="size-3.5" />
                                                </Link>
                                            </Button>
                                        )}
                                        {can.delete_equipment && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7 hover:text-destructive"
                                                onClick={() => setDeleteTarget(item)}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        data={equipment.data}
                        keyExtractor={(item) => item.id}
                    />
                    <TablePagination
                        currentPage={equipment.current_page}
                        lastPage={equipment.last_page}
                        nextUrl={equipment.next_page_url}
                        prevUrl={equipment.prev_page_url}
                    />
                </Card>

                <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete "{deleteTarget?.name}"?</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">This equipment will be permanently deleted.</p>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </AdminLayout>
    );
}
