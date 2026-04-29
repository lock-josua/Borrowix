import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Package, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import BorrowRequestModal from '@/components/BorrowRequestModal';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import StudentLayout from '@/layouts/StudentLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Browse Equipment', href: '/student/browse' },
];

interface Category {
    id: number;
    name: string;
}

interface Equipment {
    id: number;
    name: string;
    brand: string | null;
    model: string | null;
    description: string | null;
    available_quantity: number;
    quantity: number;
    image_url: string | null;
    status: string;
    category: { id: number; name: string } | null;
}

interface Props {
    equipment: {
        data: Equipment[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    categories: Category[];
    filters: { search?: string; category?: string };
}

export default function BrowseEquipment({
    equipment,
    categories,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] =
        useState<Equipment | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search ?? '')) {
                router.get(
                    '/student/browse',
                    { search: search || undefined, category: filters.category },
                    { preserveState: true, replace: true },
                );
            }
        }, 400);
        return () => clearTimeout(timeout);
    }, [search, filters.category, filters.search]);

    function setCategory(categoryId: string) {
        router.get(
            '/student/browse',
            { search: filters.search, category: categoryId || undefined },
            { preserveState: true, replace: true },
        );
    }

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Browse Equipment" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 md:p-6"
            >
                <PageHeader
                    title="Browse Equipment"
                    description="Find and borrow ICT equipment for your school needs."
                />

                <Card className="mb-2 flex flex-col gap-4 p-4">
                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search equipment..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 bg-muted/20 pl-9"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={!filters.category ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 rounded-full px-4 text-xs"
                            onClick={() => setCategory('')}
                        >
                            All
                        </Button>
                        {categories.map((cat) => (
                            <Button
                                key={cat.id}
                                variant={
                                    filters.category === String(cat.id)
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                className="h-8 rounded-full px-4 text-xs"
                                onClick={() => setCategory(String(cat.id))}
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                </Card>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {equipment.data.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                delay: i * 0.04,
                                duration: 0.2,
                                ease: 'easeOut',
                            }}
                        >
                            <Card className="flex h-full flex-col overflow-hidden transition-colors duration-150 hover:border-primary/40">
                                <div className="flex h-36 items-center justify-center border-b border-border bg-muted">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            className="h-full w-full object-cover"
                                            alt={item.name}
                                        />
                                    ) : (
                                        <Package className="size-10 text-muted-foreground/30" />
                                    )}
                                </div>
                                <CardContent className="flex flex-1 flex-col gap-2 p-3">
                                    <div>
                                        <p className="line-clamp-2 text-sm leading-tight font-medium text-foreground">
                                            {item.name}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {item.category?.name}
                                        </p>
                                    </div>
                                    <div className="mt-auto flex items-center justify-between pt-1">
                                        <StatusBadge status={item.status} />
                                        <Button
                                            size="sm"
                                            variant={
                                                item.status === 'available'
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            disabled={
                                                item.status !== 'available'
                                            }
                                            className="h-7 text-xs"
                                            onClick={() => {
                                                if (
                                                    item.status === 'available'
                                                ) {
                                                    setSelectedEquipment(item);
                                                    setIsOpen(true);
                                                }
                                            }}
                                        >
                                            {item.status === 'available'
                                                ? 'Borrow'
                                                : 'Unavailable'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {equipment.data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                        <Package className="mb-4 size-12 opacity-20" />
                        <p>No equipment found matching your criteria.</p>
                    </div>
                )}

                {selectedEquipment && (
                    <BorrowRequestModal
                        equipment={selectedEquipment!}
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                    />
                )}
            </motion.div>
        </StudentLayout>
    );
}
