import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    equipment: {
        data: Equipment[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    filters: { search?: string; status?: string };
}

export default function StaffEquipmentIndex({ equipment, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/staff/equipment', { search }, { preserveState: true });
    }

    return (
        <StaffLayout breadcrumbs={breadcrumbs}>
            <Head title="Equipment" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader title="Equipment" description="View ICT equipment inventory." />

                {/* Filter bar */}
                <Card className="flex flex-row flex-wrap items-center gap-2 p-3 py-3">
                    <form onSubmit={handleSearch} className="relative min-w-[220px] flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                            className="pl-8 h-9 text-sm bg-muted/20"
                            placeholder="Search equipment..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                </Card>

                {/* Table */}
                <Card className="overflow-hidden p-0 border-border/60">
                    <DataTable
                        columns={[
                            {
                                key: 'name',
                                label: 'Name',
                                width: '35%',
                                render: (item) => (
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground truncate">{item.name}</span>
                                        <span className="text-[10px] text-muted-foreground truncate">
                                            {[item.brand, item.model].filter(Boolean).join(' / ') || '—'}
                                        </span>
                                    </div>
                                ),
                            },
                            {
                                key: 'category',
                                label: 'Category',
                                width: '20%',
                                render: (item) => <span className="text-muted-foreground text-xs">{item.category?.name ?? '—'}</span>,
                            },
                            {
                                key: 'available',
                                label: 'Available',
                                width: '15%',
                                align: 'center',
                                render: (item) => <span className="font-bold text-primary">{item.available_quantity}</span>,
                            },
                            {
                                key: 'total',
                                label: 'Total',
                                width: '15%',
                                align: 'center',
                                render: (item) => <span className="text-muted-foreground">{item.quantity}</span>,
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                width: '15%',
                                align: 'center',
                                render: (item) => <StatusBadge status={item.status} />,
                            },
                        ]}
                        data={equipment.data}
                        keyExtractor={(item) => item.id}
                    />
                    <TablePagination
                        currentPage={equipment.current_page}
                        lastPage={equipment.last_page}
                        nextUrl={equipment.next_page_url}
                        prevUrl={equipment.prev_page_url}
                    />
                </Card>
            </motion.div>
        </StaffLayout>
    );
}
