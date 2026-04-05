import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Categories', href: '/admin/categories' },
];

interface Category {
    id: number;
    name: string;
    description: string | null;
    equipment_count: number;
}

interface Props {
    categories: Category[];
}

export default function CategoriesIndex({ categories }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
    const [editTarget, setEditTarget] = useState<Category | null>(null);

    const createForm = useForm({ name: '', description: '' });
    const editForm = useForm({ name: '', description: '' });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/admin/categories', { onSuccess: () => createForm.reset() });
    }

    function openEdit(cat: Category) {
        setEditTarget(cat);
        editForm.setData({ name: cat.name, description: cat.description ?? '' });
    }

    function handleEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.patch(`/admin/categories/${editTarget.id}`, { onSuccess: () => setEditTarget(null) });
    }

    function handleDelete() {
        if (!deleteTarget) return;
        router.delete(`/admin/categories/${deleteTarget.id}`, { onSuccess: () => setDeleteTarget(null) });
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="flex flex-col gap-6 p-6">
                <h1 className="text-2xl font-bold">Categories</h1>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Create Form */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">New Category</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreate} className="space-y-3">
                                <div className="space-y-1">
                                    <Label>Name</Label>
                                    <Input placeholder="Laptops" value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} />
                                    {createForm.errors.name && <p className="text-xs text-destructive">{createForm.errors.name}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Description</Label>
                                    <Input placeholder="Optional" value={createForm.data.description} onChange={(e) => createForm.setData('description', e.target.value)} />
                                </div>
                                <Button type="submit" disabled={createForm.processing} className="w-full">
                                    <Plus className="mr-2 size-4" />Add Category
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* List */}
                    <Card className="lg:col-span-2">
                        <CardHeader><CardTitle className="text-base">{categories.length} categories</CardTitle></CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="table table-sm w-full">
                                    <thead>
                                        <tr className="text-muted-foreground">
                                            <th>Name</th>
                                            <th>Description</th>
                                            <th>Equipment</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.length === 0 ? (
                                            <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">No categories yet.</td></tr>
                                        ) : (
                                            categories.map((cat) => (
                                                <tr key={cat.id} className="hover">
                                                    <td className="font-medium">{cat.name}</td>
                                                    <td className="text-muted-foreground">{cat.description ?? '—'}</td>
                                                    <td>{cat.equipment_count}</td>
                                                    <td>
                                                        <div className="flex gap-1">
                                                            <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Pencil className="size-4" /></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(cat)}><Trash2 className="size-4 text-destructive" /></Button>
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
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-3">
                        <div className="space-y-1">
                            <Label>Name</Label>
                            <Input value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} />
                            {editForm.errors.name && <p className="text-xs text-destructive">{editForm.errors.name}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label>Description</Label>
                            <Input value={editForm.data.description} onChange={(e) => editForm.setData('description', e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setEditTarget(null)}>Cancel</Button>
                            <Button type="submit" disabled={editForm.processing}>Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete "{deleteTarget?.name}"?</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Equipment in this category will be uncategorized.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}