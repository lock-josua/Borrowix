import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

interface Equipment {
    id: number;
    name: string;
    brand: string | null;
    model: string | null;
    serial_number: string | null;
    description: string | null;
    quantity: number;
    available_quantity: number;
    status: string;
    condition_notes: string | null;
    damage_photo: string | null;
    created_at: string;
    updated_at: string;
    category: { id: number; name: string } | null;
    borrow_transactions_count: number;
}

interface Props { equipment: Equipment; }

const statusBadge: Record<string, string> = {
    available:    'badge-success',
    borrowed:     'badge-warning',
    under_repair: 'badge-error',
    reserved:     'badge-info',
    retired:      'badge-neutral',
};

export default function EquipmentShow({ equipment: e }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Equipment', href: '/admin/equipment' },
        { title: e.name, href: `/admin/equipment/${e.id}` },
    ];

    const borrowedCount = e.quantity - e.available_quantity;
    const availabilityPct = e.quantity > 0 ? (e.available_quantity / e.quantity) * 100 : 0;

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={e.name} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/equipment">
                            <Button variant="ghost" size="icon"><ArrowLeft className="size-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{e.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                {[e.brand, e.model].filter(Boolean).join(' · ') || 'No brand / model specified'}
                            </p>
                        </div>
                        <span className={`badge capitalize ${statusBadge[e.status] ?? 'badge-ghost'}`}>
                            {e.status.replace('_', ' ')}
                        </span>
                    </div>
                    <Link href={`/admin/equipment/${e.id}/edit`}>
                        <Button variant="outline">
                            <Pencil className="mr-2 size-4" />Edit
                        </Button>
                    </Link>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label="Total Qty"     value={e.quantity} />
                    <StatCard label="Available"     value={e.available_quantity} highlight={e.available_quantity > 0 ? 'green' : 'red'} />
                    <StatCard label="Borrowed"      value={borrowedCount} />
                    <StatCard label="Total Borrows" value={e.borrow_transactions_count} />
                </div>

                {/* Availability bar */}
                <Card>
                    <CardContent className="pt-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Availability</span>
                            <span className="font-medium">
                                {e.available_quantity} / {e.quantity} units available
                            </span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${availabilityPct}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6">
                    {/* Equipment Details */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Equipment Details</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <Row label="Category"     value={e.category?.name ?? '—'} />
                            <Row label="Brand"        value={e.brand ?? '—'} />
                            <Row label="Model"        value={e.model ?? '—'} />
                            <Row label="Serial No."   value={e.serial_number ?? '—'} />
                            <Row label="Added"        value={new Date(e.created_at).toLocaleDateString()} />
                            <Row label="Last Updated" value={new Date(e.updated_at).toLocaleDateString()} />
                            {e.description && <Row label="Description" value={e.description} />}
                            {e.condition_notes && <Row label="Condition" value={e.condition_notes} />}
                        </CardContent>
                    </Card>
                </div>

                {/* Damage photo if present */}
                {e.damage_photo && (
                    <Card>
                        <CardHeader><CardTitle className="text-base text-destructive">Damage Photo</CardTitle></CardHeader>
                        <CardContent>
                            <img
                                src={e.damage_photo}
                                alt="Damage"
                                className="max-h-64 rounded-lg object-cover border"
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between border-b pb-2 last:border-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: 'green' | 'red' }) {
    const color = highlight === 'green'
        ? 'text-green-600'
        : highlight === 'red'
        ? 'text-destructive'
        : '';
    return (
        <Card>
            <CardContent className="pt-4">
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{label}</div>
            </CardContent>
        </Card>
    );
}