import { Head, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
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
    created_at?: string;
}

interface Props {
    categories: Category[];
}

export default function CategoriesIndex({ categories }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
    const [editTarget, setEditTarget] = useState<Category | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const createForm = useForm({ name: '', description: '' });
    const editForm = useForm({ name: '', description: '' });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/admin/categories', {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    }

    function openEdit(cat: Category) {
        setEditTarget(cat);
        editForm.setData({
            name: cat.name,
            description: cat.description ?? '',
        });
    }

    function handleEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.patch(`/admin/categories/${editTarget.id}`, {
            onSuccess: () => setEditTarget(null),
        });
    }

    function handleDelete() {
        if (!deleteTarget) return;
        router.delete(`/admin/categories/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Categories"
                    description="Manage equipment categories"
                    actions={
                        <Button
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <Plus className="size-3.5" />
                            Add Category
                        </Button>
                    }
                />

                {/* Table */}
                <Card className="overflow-hidden border-border/60 p-0">
                    <DataTable
                        columns={[
                            {
                                key: 'name',
                                label: 'Name',
                                width: '45%',
                                render: (cat) => (
                                    <div className="flex flex-col">
                                        <span className="truncate font-medium text-foreground">
                                            {cat.name}
                                        </span>
                                        {cat.description && (
                                            <span className="truncate text-xs text-muted-foreground">
                                                {cat.description}
                                            </span>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: 'equipment_count',
                                label: 'Equipment Count',
                                width: '25%',
                                align: 'center',
                                render: (cat) => (
                                    <span className="font-medium text-muted-foreground">
                                        {cat.equipment_count}
                                    </span>
                                ),
                            },
                            {
                                key: 'created',
                                label: 'Created',
                                width: '20%',
                                render: (cat) => (
                                    <span className="text-xs text-muted-foreground">
                                        {cat.created_at || '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'actions',
                                label: '',
                                width: '10%',
                                align: 'right',
                                render: (cat) => (
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7"
                                            onClick={() => openEdit(cat)}
                                        >
                                            <Pencil className="size-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 hover:text-destructive"
                                            onClick={() => setDeleteTarget(cat)}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                ),
                            },
                        ]}
                        data={categories}
                        keyExtractor={(cat) => cat.id}
                    />
                </Card>

                {/* Create Dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Category</DialogTitle>
                            <DialogDescription>
                                Add a new category to organise your equipment.
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={handleCreate}
                            className="space-y-4 py-2"
                        >
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Name
                                </Label>
                                <Input
                                    placeholder="Laptops"
                                    value={createForm.data.name}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                />
                                {createForm.errors.name && (
                                    <p className="text-xs text-destructive">
                                        {createForm.errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Description
                                </Label>
                                <Input
                                    placeholder="Optional"
                                    value={createForm.data.description}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createForm.processing}
                                >
                                    Add Category
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog
                    open={!!editTarget}
                    onOpenChange={() => setEditTarget(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Category</DialogTitle>
                            <DialogDescription>
                                Update the name or description for this
                                category.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEdit} className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Name
                                </Label>
                                <Input
                                    value={editForm.data.name}
                                    onChange={(e) =>
                                        editForm.setData('name', e.target.value)
                                    }
                                />
                                {editForm.errors.name && (
                                    <p className="text-xs text-destructive">
                                        {editForm.errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Description
                                </Label>
                                <Input
                                    value={editForm.data.description}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setEditTarget(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={editForm.processing}
                                >
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog
                    open={!!deleteTarget}
                    onOpenChange={() => setDeleteTarget(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Delete "{deleteTarget?.name}"?
                            </DialogTitle>
                            <DialogDescription>
                                Equipment in this category will be
                                uncategorized. This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                            Equipment in this category will be uncategorized.
                        </p>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setDeleteTarget(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </AdminLayout>
    );
}
