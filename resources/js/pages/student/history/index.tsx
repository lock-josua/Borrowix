import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StudentLayout from '@/layouts/StudentLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/student/dashboard' },
    { title: 'My History', href: '/student/history' },
];

interface Transaction {
    id: number;
    equipment: { name: string };
    issued_at: string;
    returned_at: string | null;
    due_date: string;
    status: string;
    fine_amount: number;
}

interface Props {
    history: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
}

export default function StudentHistory({ history }: Props) {
    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="My History" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader title="My History" description="Your past and active equipment transactions." />

                <Card className="overflow-hidden p-0">
                    <DataTable
                        columns={[
                            {
                                key: 'equipment',
                                label: 'Equipment',
                                width: '30%',
                                render: (t) => <span className="font-medium text-foreground">{t.equipment.name}</span>,
                            },
                            {
                                key: 'borrowed',
                                label: 'Borrowed',
                                width: '18%',
                                render: (t) => <span className="text-xs">{t.issued_at}</span>,
                            },
                            {
                                key: 'returned',
                                label: 'Returned',
                                width: '18%',
                                render: (t) => <span className="text-xs">{t.returned_at || '—'}</span>,
                            },
                            {
                                key: 'duration',
                                label: 'Due',
                                width: '14%',
                                render: (t) => <span className="text-xs">{t.due_date}</span>,
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                width: '12%',
                                align: 'center',
                                render: (t) => <StatusBadge status={t.status} />,
                            },
                            {
                                key: 'actions',
                                label: '',
                                width: '8%',
                                align: 'right',
                                render: (t) => (
                                    <Button variant="ghost" size="icon" className="size-7" asChild>
                                        <Link href={`/student/transactions/${t.id}`}>
                                            <Eye className="size-3.5" />
                                        </Link>
                                    </Button>
                                ),
                            },
                        ]}
                        data={history.data}
                        keyExtractor={(t) => t.id}
                    />
                    <TablePagination
                        currentPage={history.current_page}
                        lastPage={history.last_page}
                        nextUrl={history.next_page_url}
                        prevUrl={history.prev_page_url}
                    />
                </Card>
            </motion.div>
        </StudentLayout>
    );
}
