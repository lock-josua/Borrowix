import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
}

interface Props {
    equipment: { data: Equipment[]; current_page: number; last_page: number; next_page_url: string | null; prev_page_url: string | null };
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

export default function EquipmentIndex({ equipment, categories, filters }: Props) {
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Equipment</h1>
                        <p className="text-sm text-muted-foreground">Manage your school's ICT equipment.</p>
                    </div>
                    <Link href="/admin/equipment/create">
                        <Button><Plus className="mr-2 size-4" />Add Equipment</Button>
                    </Link>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input placeholder="Search equipment..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
                            <Button type="submit" variant="outline" size="icon"><Search className="size-4" /></Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{equipment.data.length} items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="table table-sm w-full">
                                <thead>
                                    <tr className="text-muted-foreground">
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Quantity</th>
                                        <th>Available</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipment.data.length === 0 ? (
                                        <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No equipment found.</td></tr>
                                    ) : (
                                        equipment.data.map((e) => (
                                            <tr key={e.id} className="hover">
                                                <td>
                                                    <div className="font-medium">{e.name}</div>
                                                    {(e.brand || e.model) && <div className="text-xs text-muted-foreground">{[e.brand, e.model].filter(Boolean).join(' · ')}</div>}
                                                </td>
                                                <td>{e.category?.name ?? '—'}</td>
                                                <td>{e.quantity}</td>
                                                <td>{e.available_quantity}</td>
                                                <td><span className={`badge badge-sm capitalize ${statusBadge[e.status]}`}>{e.status.replace('_', ' ')}</span></td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <Link href={`/admin/equipment/${e.id}/edit`}>
                                                            <Button variant="ghost" size="icon"><Pencil className="size-4" /></Button>
                                                        </Link>
                                                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(e)}>
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
                        {equipment.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-2">
                                {equipment.prev_page_url && <Link href={equipment.prev_page_url}><Button variant="outline" size="sm">Previous</Button></Link>}
                                <span className="flex items-center text-sm text-muted-foreground">Page {equipment.current_page} of {equipment.last_page}</span>
                                {equipment.next_page_url && <Link href={equipment.next_page_url}><Button variant="outline" size="sm">Next</Button></Link>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete "{deleteTarget?.name}"?</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">This equipment will be permanently deleted.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}