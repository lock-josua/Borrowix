import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentLayout from '@/layouts/StudentLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/student/dashboard' },
    { title: 'My Requests', href: '/student/borrow-requests' },
    { title: 'New Request', href: '/student/borrow-requests/create' },
];

interface Equipment { id: number; name: string; brand: string | null; model: string | null; available_quantity: number; category: { name: string } | null; }
interface Props { equipment: Equipment[]; }

export default function CreateRequest({ equipment }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        equipment_id: '',
        purpose: '',
        borrow_date: '',
        expected_return_date: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/student/borrow-requests');
    }

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="New Borrow Request" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-3">
                    <Link href="/student/borrow-requests"><Button variant="ghost" size="icon"><ArrowLeft className="size-4" /></Button></Link>
                    <h1 className="text-2xl font-bold">New Borrow Request</h1>
                </div>

                <Card className="max-w-lg">
                    <CardHeader><CardTitle className="text-base">Request Details</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label>Equipment</Label>
                                <Select value={data.equipment_id} onValueChange={(v) => setData('equipment_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select equipment to borrow" /></SelectTrigger>
                                    <SelectContent>
                                        {equipment.length === 0 ? (
                                            <SelectItem value="none" disabled>No equipment available</SelectItem>
                                        ) : equipment.map((e) => (
                                            <SelectItem key={e.id} value={String(e.id)}>
                                                {e.name} {e.brand ? `(${e.brand})` : ''} — {e.available_quantity} available
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.equipment_id && <p className="text-xs text-destructive">{errors.equipment_id}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label>Purpose</Label>
                                <Input placeholder="e.g. For thesis presentation" value={data.purpose} onChange={(e) => setData('purpose', e.target.value)} />
                                {errors.purpose && <p className="text-xs text-destructive">{errors.purpose}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label>Borrow Date & Time</Label>
                                <Input type="datetime-local" value={data.borrow_date} onChange={(e) => setData('borrow_date', e.target.value)} />
                                {errors.borrow_date && <p className="text-xs text-destructive">{errors.borrow_date}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label>Return Date & Time</Label>
                                <Input type="datetime-local" value={data.expected_return_date} onChange={(e) => setData('expected_return_date', e.target.value)} />
                                {errors.expected_return_date && <p className="text-xs text-destructive">{errors.expected_return_date}</p>}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={processing}>{processing ? 'Submitting...' : 'Submit Request'}</Button>
                                <Link href="/student/borrow-requests"><Button variant="outline" type="button">Cancel</Button></Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}