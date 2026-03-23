import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

    // Debounce search — fire request 400ms after user stops typing
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
    }, [search]);

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

            <div className="flex flex-col">
                {/* ── Sticky search + filter bar ── */}
                <div className="sticky top-14 z-30 border-b bg-background/95 px-4 pt-3 pb-3 backdrop-blur lg:top-0">
                    {/* Search input */}
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search equipment..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Category filter pills */}
                    <div className="scrollbar-hide mt-2.5 flex gap-2 overflow-x-auto pb-0.5">
                        <button
                            onClick={() => setCategory('')}
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                !filters.category
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(String(cat.id))}
                                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                    filters.category === String(cat.id)
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Equipment grid ── */}
                <div className="p-4">
                    {equipment.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Package className="mb-3 size-12 text-muted-foreground/30" />
                            <p className="font-medium text-muted-foreground">
                                No equipment found
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Try a different search or category.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="mb-3 text-xs text-muted-foreground">
                                {equipment.data.length} item
                                {equipment.data.length !== 1 ? 's' : ''}{' '}
                                available
                                {filters.search && ` for "${filters.search}"`}
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                {equipment.data.map((item) => (
                                    <EquipmentCard key={item.id} item={item} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {equipment.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-between border-t pt-4">
                                    <p className="text-xs text-muted-foreground">
                                        Page {equipment.current_page} of{' '}
                                        {equipment.last_page}
                                    </p>
                                    <div className="flex gap-2">
                                        {equipment.prev_page_url && (
                                            <Link
                                                href={equipment.prev_page_url}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    ← Prev
                                                </Button>
                                            </Link>
                                        )}
                                        {equipment.next_page_url && (
                                            <Link
                                                href={equipment.next_page_url}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Next →
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}

// ── Equipment Card ─────────────────────────────────────────────
function EquipmentCard({ item }: { item: Equipment }) {
    return (
        <div className="flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:bg-muted/30">
            {/* Image */}
            <div className="relative aspect-square w-full overflow-hidden bg-muted/50">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center">
                        <Package className="size-10 text-muted-foreground/25" />
                    </div>
                )}

                {/* Available quantity badge */}
                <div className="absolute right-2 bottom-2">
                    <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            item.available_quantity > 0
                                ? 'bg-emerald-500/90 text-white'
                                : 'bg-red-500/90 text-white'
                        }`}
                    >
                        {item.available_quantity} left
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col p-3">
                <p className="line-clamp-2 text-[13px] leading-snug font-semibold text-foreground">
                    {item.name}
                </p>
                {(item.brand || item.model) && (
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                        {[item.brand, item.model].filter(Boolean).join(' · ')}
                    </p>
                )}
                {item.category && (
                    <span className="mt-1.5 inline-block self-start rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        {item.category.name}
                    </span>
                )}

                {/* Borrow button */}
                <div className="mt-auto pt-3">
                    <Link
                        href={`/student/borrow-requests/create?equipment_id=${item.id}`}
                        className="block"
                    >
                        <Button
                            size="sm"
                            className="w-full text-xs"
                            disabled={item.available_quantity === 0}
                        >
                            {item.available_quantity > 0
                                ? 'Borrow'
                                : 'Unavailable'}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
