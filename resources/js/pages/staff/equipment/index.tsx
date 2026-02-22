import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StaffLayout from '@/layouts/StaffLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/staff/dashboard' },
    { title: 'Equipment', href: '/staff/equipment' },
];

interface Equipment {
    id: number;
    name: string;
    brand: string | null;
    model: string | null;
    available_quantity: number;
    quantity: number;
    status: string;
    category: { name: string } | null;
}

interface Props {
    equipment: { data: Equipment[]; current_page: number; last_page: number; next_page_url: string | null; prev_page_url: string | null };
    filters: { search?: string; status?: string };
}

const statusBadge: Record<string, string> = {
    available: 'badge-success',
    borrowed: 'badge-warning',
    under_repair: 'badge-error',
    retired: 'badge-neutral',
};

export default function StaffEquipmentIndex({ equipment, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/staff/equipment', { search }, { preserveState: true });
    }

    return (
        <StaffLayout breadcrumbs={breadcrumbs}>
            <Head title="Equipment" />
            <div className="flex flex-col gap-6 p-6">
                <h1 className="text-2xl font-bold">Equipment</h1>

                <Card>
                    <CardContent className="pt-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
                            <Button type="submit" variant="outline" size="icon"><Search className="size-4" /></Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="overflow-x-auto">
                            <table className="table table-sm w-full">
                                <thead>
                                    <tr className="text-muted-foreground"><th>Name</th><th>Category</th><th>Available</th><th>Status</th><th></th></tr>
                                </thead>
                                <tbody>
                                    {equipment.data.length === 0 ? (
                                        <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No equipment found.</td></tr>
                                    ) : equipment.data.map((e) => (
                                        <tr key={e.id} className="hover">
                                            <td>
                                                <div className="font-medium">{e.name}</div>
                                                {(e.brand || e.model) && <div className="text-xs text-muted-foreground">{[e.brand, e.model].filter(Boolean).join(' · ')}</div>}
                                            </td>
                                            <td>{e.category?.name ?? '—'}</td>
                                            <td>{e.available_quantity} / {e.quantity}</td>
                                            <td><span className={`badge badge-sm capitalize ${statusBadge[e.status]}`}>{e.status.replace('_', ' ')}</span></td>
                                            <td>
                                                <Link href={`/staff/equipment/${e.id}`}>
                                                    <Button variant="ghost" size="icon"><Eye className="size-4" /></Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {equipment.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-2">
                                {equipment.prev_page_url && <Link href={equipment.prev_page_url}><Button variant="outline" size="sm">Previous</Button></Link>}
                                <span className="flex items-center text-sm text-muted-foreground">Page {equipment.current_page} of {equipment.last_page}</span>
                                {equipment.next_page_url && <Link href={equipment.next_page_url}><Button variant="outline" size="sm">Next</Button></Link>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StaffLayout>
    );
}