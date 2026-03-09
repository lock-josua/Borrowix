import { Head, Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/layouts/StudentLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/student/dashboard' },
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
    history: { data: Transaction[]; current_page: number; last_page: number; next_page_url: string | null; prev_page_url: string | null };
}

const statusBadge: Record<string, string> = {
    active: 'badge-info',
    returned: 'badge-success',
    overdue: 'badge-error',
};

export default function StudentHistory({ history }: Props) {
    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="My History" />
            <div className="flex flex-col gap-6 p-6">
                <h1 className="text-2xl font-bold">My Borrowing History</h1>

                <Card>
                    <CardContent className="pt-4">
                        <div className="overflow-x-auto">
                            <table className="table table-sm w-full">
                                <thead>
                                    <tr className="text-muted-foreground"><th>Equipment</th><th>Issued</th><th>Due</th><th>Returned</th><th>Status</th><th>Fine</th><th></th></tr>
                                </thead>
                                <tbody>
                                    {history.data.length === 0 ? (
                                        <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No borrowing history yet.</td></tr>
                                    ) : history.data.map((t) => (
                                        <tr key={t.id} className="hover">
                                            <td className="font-medium">{t.equipment.name}</td>
                                            <td className="text-xs">{new Date(t.issued_at).toLocaleString()}</td>
                                            <td className="text-xs">{new Date(t.due_date).toLocaleString()}</td>
                                            <td className="text-xs">{t.returned_at ? new Date(t.returned_at).toLocaleString() : '—'}</td>
                                            <td><span className={`badge badge-sm capitalize ${statusBadge[t.status]}`}>{t.status}</span></td>
                                            <td>{t.fine_amount > 0 ? <span className="text-destructive font-medium">₱{t.fine_amount}</span> : '—'}</td>
                                            <td>
                                                <Link href={`/student/history/${t.id}`}>
                                                    <Button variant="ghost" size="icon"><Eye className="size-4" /></Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {history.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-2">
                                {history.prev_page_url && <Link href={history.prev_page_url}><Button variant="outline" size="sm">Previous</Button></Link>}
                                <span className="flex items-center text-sm text-muted-foreground">Page {history.current_page} of {history.last_page}</span>
                                {history.next_page_url && <Link href={history.next_page_url}><Button variant="outline" size="sm">Next</Button></Link>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}