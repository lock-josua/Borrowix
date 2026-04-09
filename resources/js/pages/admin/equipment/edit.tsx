import { Head, Link, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Package, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

interface Equipment {
    id: number;
    name: string;
    category_id: number | null;
    description: string | null;
    brand: string | null;
    model: string | null;
    serial_number: string | null;
    quantity: number;
    status: string;
    image: string | null;
}

interface Props {
    equipment: Equipment;
    categories: { id: number; name: string }[];
}

export default function EquipmentEdit({ equipment, categories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Equipment', href: '/admin/equipment' },
        { title: equipment.name, href: `/admin/equipment/${equipment.id}/edit` },
    ];

    const { data, setData, processing, errors } = useForm({
        name: equipment.name,
        category_id: equipment.category_id ? String(equipment.category_id) : '',
        description: equipment.description ?? '',
        brand: equipment.brand ?? '',
        model: equipment.model ?? '',
        serial_number: equipment.serial_number ?? '',
        quantity: String(equipment.quantity),
        status: equipment.status,
        image: null as File | null,
        remove_image: false,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.post(
            `/admin/equipment/${equipment.id}`,
            {
                ...data,
                _method: 'patch',
            },
            {
                forceFormData: true,
            },
        );
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${equipment.name}`} />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Edit Equipment"
                    description={`Updating ${equipment.name}`}
                    actions={
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/equipment">
                                <ArrowLeft className="size-3.5 mr-1.5" /> Back
                            </Link>
                        </Button>
                    }
                />

                <div className="max-w-2xl mx-auto w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Equipment Information</CardTitle>
                            <CardDescription>Update the details for this equipment item.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="name">
                                            Name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                        />
                                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="category">Category</Label>
                                        <Select value={data.category_id} onValueChange={(v) => setData('category_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category_id && <p className="text-xs text-destructive">{errors.category_id}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="brand">Brand</Label>
                                        <Input
                                            id="brand"
                                            value={data.brand}
                                            onChange={(e) => setData('brand', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="model">Model</Label>
                                        <Input
                                            id="model"
                                            value={data.model}
                                            onChange={(e) => setData('model', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="serial_number">Serial Number</Label>
                                    <Input
                                        id="serial_number"
                                        value={data.serial_number}
                                        onChange={(e) => setData('serial_number', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="quantity">
                                            Total Quantity <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            min="1"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', e.target.value)}
                                        />
                                        {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="under_repair">Under Repair</SelectItem>
                                                <SelectItem value="retired">Retired</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Equipment Photo</Label>
                                    {equipment.image && !data.remove_image && (
                                        <div className="mb-4 relative w-fit group">
                                            <img
                                                src={equipment.image}
                                                alt={equipment.name}
                                                className="h-32 w-32 rounded-lg object-cover border shadow-sm"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 size-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => setData('remove_image', true)}
                                            >
                                                <Trash2 className="size-3" />
                                            </Button>
                                        </div>
                                    )}
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setData((prev) => ({
                                                    ...prev,
                                                    image: e.target.files![0],
                                                    remove_image: false,
                                                }));
                                            }
                                        }}
                                        disabled={data.remove_image}
                                    />
                                    {data.remove_image && <p className="text-xs text-destructive mt-1">Image will be removed.</p>}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 border-t pt-4">
                                <Button variant="outline" asChild>
                                    <Link href="/admin/equipment">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 size-3.5 animate-spin" />}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </motion.div>
        </AdminLayout>
    );
}
