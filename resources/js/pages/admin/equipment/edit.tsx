import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

    const { data, setData, patch, processing, errors } = useForm({
        name: equipment.name,
        category_id: equipment.category_id ? String(equipment.category_id) : '',
        description: equipment.description ?? '',
        brand: equipment.brand ?? '',
        model: equipment.model ?? '',
        serial_number: equipment.serial_number ?? '',
        quantity: String(equipment.quantity),
        status: equipment.status,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        patch(`/admin/equipment/${equipment.id}`);
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${equipment.name}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-3">
                    <Link href="/admin/equipment">
                        <Button variant="ghost" size="icon"><ArrowLeft className="size-4" /></Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Edit Equipment</h1>
                </div>

                <Card className="max-w-lg">
                    <CardHeader><CardTitle className="text-base">{equipment.name}</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Field label="Name" error={errors.name}>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
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
                                <Input value={data.brand} onChange={(e) => setData('brand', e.target.value)} />
                            </Field>

                            <Field label="Model" error={errors.model}>
                                <Input value={data.model} onChange={(e) => setData('model', e.target.value)} />
                            </Field>

                            <Field label="Serial Number" error={errors.serial_number}>
                                <Input value={data.serial_number} onChange={(e) => setData('serial_number', e.target.value)} />
                            </Field>

                            <Field label="Description" error={errors.description}>
                                <Input value={data.description} onChange={(e) => setData('description', e.target.value)} />
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

                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save Changes'}</Button>
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