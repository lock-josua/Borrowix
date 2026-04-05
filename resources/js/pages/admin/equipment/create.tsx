import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-3">
                    <Link href="/admin/equipment">
                        <Button variant="ghost" size="icon"><ArrowLeft className="size-4" /></Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Add Equipment</h1>
                </div>

                <Card className="max-w-lg">
                    <CardHeader><CardTitle className="text-base">Equipment Details</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Field label="Name" error={errors.name}>
                                <Input placeholder="Dell Latitude 5520" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            </Field>

                            <Field label="Category" error={errors.category_id}>
                                <Select value={data.category_id} onValueChange={(v) => setData('category_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field label="Brand" error={errors.brand}>
                                <Input placeholder="Dell" value={data.brand} onChange={(e) => setData('brand', e.target.value)} />
                            </Field>

                            <Field label="Model" error={errors.model}>
                                <Input placeholder="Latitude 5520" value={data.model} onChange={(e) => setData('model', e.target.value)} />
                            </Field>

                            <Field label="Serial Number" error={errors.serial_number}>
                                <Input placeholder="SN-001" value={data.serial_number} onChange={(e) => setData('serial_number', e.target.value)} />
                            </Field>

                            <Field label="Description" error={errors.description}>
                                <Input placeholder="Optional description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                            </Field>

                            <Field label="Quantity" error={errors.quantity}>
                                <Input type="number" min="1" value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} />
                            </Field>

                            <Field label="Status" error={errors.status}>
                                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="under_repair">Under Repair</SelectItem>
                                        <SelectItem value="retired">Retired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field label="Image" error={errors.image}>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setData('image', e.target.files[0]);
                                        }
                                    }}
                                />
                            </Field>

                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Add Equipment'}</Button>
                                <Link href="/admin/equipment"><Button variant="outline" type="button">Cancel</Button></Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}