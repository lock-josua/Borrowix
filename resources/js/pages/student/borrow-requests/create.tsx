import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StudentLayout from '@/layouts/StudentLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/student/dashboard' },
    { title: 'New Request', href: '/student/borrow-requests/create' },
];

interface Equipment {
    id: number;
    name: string;
    brand: string | null;
    model: string | null;
    available_quantity: number;
    image_url: string | null;
    category: { name: string } | null;
}

interface Props {
    equipment: Equipment[];
    preselectedEquipmentId?: string | null;
}

export default function CreateRequest({
    equipment,
    preselectedEquipmentId,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        equipment_id: preselectedEquipmentId ?? '',
        purpose: '',
        borrow_date: '',
        expected_return_date: '',
    });

    // Sync preselection if it arrives after mount
    useEffect(() => {
        if (preselectedEquipmentId) {
            setData('equipment_id', preselectedEquipmentId);
        }
    }, [preselectedEquipmentId]);

    const selectedEquipment =
        equipment.find((e) => String(e.id) === data.equipment_id) ?? null;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/student/borrow-requests');
    }

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="New Borrow Request" />

            <div className="flex flex-col gap-4 p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/student/borrow-requests">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            New Borrow Request
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Fill in the details below to request equipment.
                        </p>
                    </div>
                </div>

                <Card className="lg:max-w-lg">
                    <CardContent className="pt-5">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Equipment selection */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Equipment
                                </Label>

                                {/* Selected equipment preview */}
                                {selectedEquipment ? (
                                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                                        <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                                            {selectedEquipment.image_url ? (
                                                <img
                                                    src={
                                                        selectedEquipment.image_url
                                                    }
                                                    alt={selectedEquipment.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Package className="size-5 text-muted-foreground/40" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {selectedEquipment.name}
                                            </p>
                                            {(selectedEquipment.brand ||
                                                selectedEquipment.model) && (
                                                <p className="text-xs text-muted-foreground">
                                                    {[
                                                        selectedEquipment.brand,
                                                        selectedEquipment.model,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </p>
                                            )}
                                            <p className="text-xs text-emerald-600">
                                                {
                                                    selectedEquipment.available_quantity
                                                }{' '}
                                                available
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="shrink-0 text-xs text-muted-foreground"
                                            onClick={() =>
                                                router.visit('/student/browse')
                                            }
                                        >
                                            Change
                                        </Button>
                                    </div>
                                ) : (
                                    <Link href="/student/browse">
                                        <div className="flex items-center gap-3 rounded-lg border border-dashed p-3 transition-colors hover:bg-muted/30">
                                            <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                                                <Package className="size-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Select equipment
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Tap to browse available
                                                    equipment
                                                </p>
                                            </div>
                                            <span className="ml-auto text-muted-foreground">
                                                →
                                            </span>
                                        </div>
                                    </Link>
                                )}

                                {/* Hidden select for non-browse path — fallback */}
                                {equipment.length > 0 && !selectedEquipment && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">
                                            Or choose from the list:
                                        </p>
                                        <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
                                            {equipment.map((e) => (
                                                <button
                                                    key={e.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setData(
                                                            'equipment_id',
                                                            String(e.id),
                                                        )
                                                    }
                                                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/50 ${
                                                        data.equipment_id ===
                                                        String(e.id)
                                                            ? 'bg-primary/10 text-primary'
                                                            : ''
                                                    }`}
                                                >
                                                    <span className="flex-1 truncate">
                                                        {e.name}
                                                    </span>
                                                    <span className="shrink-0 text-xs text-muted-foreground">
                                                        {e.available_quantity}{' '}
                                                        avail.
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {errors.equipment_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.equipment_id}
                                    </p>
                                )}
                            </div>

                            {/* Purpose */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Purpose
                                </Label>
                                <Input
                                    placeholder="e.g. For thesis presentation"
                                    value={data.purpose}
                                    onChange={(e) =>
                                        setData('purpose', e.target.value)
                                    }
                                />
                                {errors.purpose && (
                                    <p className="text-xs text-destructive">
                                        {errors.purpose}
                                    </p>
                                )}
                            </div>

                            {/* Borrow date */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Borrow Date
                                </Label>
                                <Input
                                    type="datetime-local"
                                    value={data.borrow_date}
                                    onChange={(e) =>
                                        setData('borrow_date', e.target.value)
                                    }
                                />
                                {errors.borrow_date && (
                                    <p className="text-xs text-destructive">
                                        {errors.borrow_date}
                                    </p>
                                )}
                            </div>

                            {/* Return date */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Return Date
                                </Label>
                                <Input
                                    type="datetime-local"
                                    value={data.expected_return_date}
                                    onChange={(e) =>
                                        setData(
                                            'expected_return_date',
                                            e.target.value,
                                        )
                                    }
                                />
                                {errors.expected_return_date && (
                                    <p className="text-xs text-destructive">
                                        {errors.expected_return_date}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    {processing
                                        ? 'Submitting...'
                                        : 'Submit Request'}
                                </Button>
                                <Link href="/student/borrow-requests">
                                    <Button variant="outline" type="button">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}
