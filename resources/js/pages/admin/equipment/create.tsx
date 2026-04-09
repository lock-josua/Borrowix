import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Package } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Equipment', href: '/admin/equipment' },
    { title: 'Add Equipment', href: '/admin/equipment/create' },
];

interface Props {
    categories: { id: number; name: string }[];
}

export default function EquipmentCreate({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        category_id: '',
        description: '',
        brand: '',
        model: '',
        serial_number: '',
        quantity: '1',
        status: 'available',
        image: null as File | null,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/equipment');
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Equipment" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Add Equipment"
                    description="Add new ICT equipment to inventory"
                    actions={
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/equipment">
                                <ArrowLeft className="size-3.5 mr-1.5" /> Back
                            </Link>
                        </Button>
                    }
                />

                <div className="max-w-2xl mx-auto w-full">
                    <Card shadow-sm>
                        <CardHeader>
                            <CardTitle>Equipment Information</CardTitle>
                            <CardDescription>Fill in the details for this equipment item.</CardDescription>
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
                                            placeholder="Dell Latitude 5520"
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
                                            placeholder="e.g. Dell"
                                            value={data.brand}
                                            onChange={(e) => setData('brand', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="model">Model</Label>
                                        <Input
                                            id="model"
                                            placeholder="e.g. Latitude"
                                            value={data.model}
                                            onChange={(e) => setData('model', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="serial_number">Serial Number</Label>
                                    <Input
                                        id="serial_number"
                                        placeholder="Optional"
                                        value={data.serial_number}
                                        onChange={(e) => setData('serial_number', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Extra details..."
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
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 border-t pt-4">
                                <Button variant="outline" asChild>
                                    <Link href="/admin/equipment">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 size-3.5 animate-spin" />}
                                    Save Equipment
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </motion.div>
        </AdminLayout>
    );
}
