import { Head, Link, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Package } from 'lucide-react';
import { useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

export default function CreateRequest({ equipment, preselectedEquipmentId }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        equipment_id: preselectedEquipmentId ?? '',
        purpose: '',
        borrow_date: '',
        expected_return_date: '',
    });

    useEffect(() => {
        if (preselectedEquipmentId) {
            setData('equipment_id', preselectedEquipmentId);
        }
    }, [preselectedEquipmentId]);

    const selectedEquipment = equipment.find((e) => String(e.id) === data.equipment_id) ?? null;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/student/borrow-requests');
    }

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="New Borrow Request" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="New Borrow Request"
                    description="Request ICT equipment for your needs."
                    actions={
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/student/borrow-requests">
                                <ArrowLeft className="size-3.5 mr-1.5" /> Back
                            </Link>
                        </Button>
                    }
                />

                <div className="max-w-2xl mx-auto w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Request Details</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label>Equipment</Label>
                                    {selectedEquipment ? (
                                        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                                            <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                                                {selectedEquipment.image_url ? (
                                                    <img src={selectedEquipment.image_url} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <Package className="size-5 text-muted-foreground/40" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{selectedEquipment.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {selectedEquipment.available_quantity} available
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs"
                                                onClick={() => setData('equipment_id', '')}
                                            >
                                                Change
                                            </Button>
                                        </div>
                                    ) : (
                                        <Select value={data.equipment_id} onValueChange={(v) => setData('equipment_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select equipment" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {equipment.map((e) => (
                                                    <SelectItem key={e.id} value={String(e.id)}>
                                                        {e.name} ({e.available_quantity} avail.)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {errors.equipment_id && <p className="text-xs text-destructive">{errors.equipment_id}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="purpose">Purpose</Label>
                                    <Textarea
                                        id="purpose"
                                        placeholder="Reason for borrowing..."
                                        value={data.purpose}
                                        onChange={(e) => setData('purpose', e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                    {errors.purpose && <p className="text-xs text-destructive">{errors.purpose}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="borrow_date">Borrow Date</Label>
                                        <Input
                                            id="borrow_date"
                                            type="date"
                                            value={data.borrow_date}
                                            onChange={(e) => setData('borrow_date', e.target.value)}
                                        />
                                        {errors.borrow_date && <p className="text-xs text-destructive">{errors.borrow_date}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="return_date">Return Date</Label>
                                        <Input
                                            id="return_date"
                                            type="date"
                                            value={data.expected_return_date}
                                            onChange={(e) => setData('expected_return_date', e.target.value)}
                                        />
                                        {errors.expected_return_date && (
                                            <p className="text-xs text-destructive">{errors.expected_return_date}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2 pt-4 border-t">
                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 size-4 animate-spin" />}
                                    Submit Request
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </motion.div>
        </StudentLayout>
    );
}
