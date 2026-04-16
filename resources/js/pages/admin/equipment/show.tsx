import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EquipmentQrCard from '@/components/EquipmentQrCard';
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
    image: string | null;
    qr_code: string | null;
    created_at: string;
    updated_at: string;
    category: { id: number; name: string } | null;
    borrow_transactions_count: number;
}

interface Props {
    equipment: Equipment;
}

export default function EquipmentShow({ equipment: e }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Equipment', href: '/admin/equipment' },
        { title: e.name, href: `/admin/equipment/${e.id}` },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={e.name} />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title={e.name}
                    description={
                        [e.brand, e.model].filter(Boolean).join(' · ') ||
                        'Equipment Details'
                    }
                    actions={
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/equipment">
                                    <ArrowLeft className="mr-1.5 size-3.5" />{' '}
                                    Back
                                </Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href={`/admin/equipment/${e.id}/edit`}>
                                    <Pencil className="mr-1.5 size-3.5" /> Edit
                                </Link>
                            </Button>
                        </div>
                    }
                />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
                    <StatCard title="Total Qty" value={e.quantity} delay={0} />
                    <StatCard
                        title="Available"
                        value={e.available_quantity}
                        valueColor={
                            e.available_quantity > 0
                                ? 'hsl(var(--primary))'
                                : 'hsl(var(--destructive))'
                        }
                        delay={0.05}
                    />
                    <StatCard
                        title="Borrowed"
                        value={e.quantity - e.available_quantity}
                        delay={0.1}
                    />
                    <StatCard
                        title="Total Borrows"
                        value={e.borrow_transactions_count}
                        delay={0.15}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-3">
                                    {[
                                        ['Category', e.category?.name ?? '—'],
                                        ['Brand', e.brand ?? '—'],
                                        ['Model', e.model ?? '—'],
                                        ['Serial No.', e.serial_number ?? '—'],
                                    ].map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="flex items-start justify-between border-b border-border py-2 last:border-0"
                                        >
                                            <dt className="w-32 shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                {label}
                                            </dt>
                                            <dd className="text-right text-sm text-foreground">
                                                {value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </CardContent>
                        </Card>

                        {e.description && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Description
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap text-foreground">
                                        {e.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-4">
                        <EquipmentQrCard
                            equipmentId={e.id}
                            equipmentName={e.name}
                            qrToken={e.qr_code}
                        />

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <StatusBadge status={e.status} />
                            </CardContent>
                        </Card>

                        {e.image && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Image
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <img
                                        src={e.image}
                                        alt={e.name}
                                        className="h-auto w-full rounded-lg border object-cover shadow-sm"
                                    />
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    System Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Added
                                        </span>
                                        <span>
                                            {new Date(
                                                e.created_at,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Last Update
                                        </span>
                                        <span>
                                            {new Date(
                                                e.updated_at,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </AdminLayout>
    );
}
