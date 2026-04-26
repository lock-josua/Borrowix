import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DetailCard } from '@/components/detail-card';
import { DetailRow } from '@/components/detail-row';
import { FormField } from '@/components/form-field';
import { PageHeader } from '@/components/page-header';
import { PageMotion } from '@/components/page-motion';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    email_verified_at: string | null;
    borrow_requests_count: number;
    borrow_transactions_count: number;
}

interface Props {
    user: User;
}

export default function UserShow({ user }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Users', href: '/admin/users' },
        { title: user.name, href: `/admin/users/${user.id}` },
    ];

    const [deleteOpen, setDeleteOpen] = useState(false);

    const { data, setData, patch, processing, errors, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            role: user.role,
        });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        patch(`/admin/users/${user.id}`);
    }

    function handleDelete() {
        router.delete(`/admin/users/${user.id}`, {
            onSuccess: () => setDeleteOpen(false),
        });
    }

    const actionButtons = (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href="/admin/users" className="gap-1.5">
                    <ArrowLeft className="size-3.5" /> Back
                </Link>
            </Button>
            <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                onClick={() => setDeleteOpen(true)}
            >
                <Trash2 className="size-3.5" /> Remove User
            </Button>
        </div>
    );

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />

            <PageMotion>
                <PageHeader
                    title={user.name}
                    description={user.email}
                    actions={actionButtons}
                />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
                    <StatCard
                        title="Borrow Requests"
                        value={user.borrow_requests_count}
                        delay={0}
                    />
                    <StatCard
                        title="Transactions"
                        value={user.borrow_transactions_count}
                        delay={0.05}
                    />
                    <StatCard
                        title="Joined"
                        value={new Date(user.created_at).toLocaleDateString()}
                        delay={0.1}
                    />
                    <StatCard
                        title="Email Verified"
                        value={user.email_verified_at ? 'Verified' : 'Pending'}
                        valueColor={
                            user.email_verified_at
                                ? 'hsl(var(--primary))'
                                : 'hsl(var(--chart-4))'
                        }
                        delay={0.15}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="rounded-xl border border-border bg-card">
                            <div className="border-b border-border px-6 py-4">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Edit Profile
                                </h3>
                            </div>
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5 p-6"
                            >
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField label="Full Name" required>
                                        <Input
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            className="h-9 transition-shadow duration-150 focus:ring-2 focus:ring-ring/30"
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-destructive">
                                                {errors.name}
                                            </p>
                                        )}
                                    </FormField>
                                    <FormField label="Email Address" required>
                                        <Input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            className="h-9 transition-shadow duration-150 focus:ring-2 focus:ring-ring/30"
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-destructive">
                                                {errors.email}
                                            </p>
                                        )}
                                    </FormField>
                                </div>
                                <FormField label="System Role" required>
                                    <Select
                                        value={data.role}
                                        onValueChange={(v) =>
                                            setData('role', v)
                                        }
                                    >
                                        <SelectTrigger className="h-9 transition-shadow duration-150 focus:ring-2 focus:ring-ring/30">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="student">
                                                Student
                                            </SelectItem>
                                            <SelectItem value="staff">
                                                Staff
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.role && (
                                        <p className="text-xs text-destructive">
                                            {errors.role}
                                        </p>
                                    )}
                                </FormField>

                                <div className="flex items-center gap-3 pt-2">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        size="sm"
                                    >
                                        {processing
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </Button>
                                    {recentlySuccessful && (
                                        <p className="flex items-center gap-1 text-sm text-emerald-600">
                                            <CheckCircle className="size-3.5" />{' '}
                                            Saved successfully
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Role Badge
                            </h3>
                            <div className="flex gap-2">
                                <StatusBadge status={user.role} />
                                {user.email_verified_at && (
                                    <StatusBadge status="verified" />
                                )}
                            </div>
                        </div>

                        <DetailCard title="Account Info">
                            <DetailRow label="User ID" value={`#${user.id}`} />
                            <DetailRow
                                label="Created At"
                                value={new Date(
                                    user.created_at,
                                ).toLocaleString()}
                            />
                            <DetailRow
                                label="Verification"
                                value={
                                    user.email_verified_at
                                        ? 'Completed'
                                        : 'Pending'
                                }
                            />
                        </DetailCard>
                    </div>
                </div>

                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remove {user.name}?</DialogTitle>
                        </DialogHeader>
                        <div className="py-2">
                            <p className="text-sm text-muted-foreground">
                                This will permanently remove{' '}
                                <strong>{user.name}</strong> from your school.
                                Their borrowing history will be preserved in the
                                system logs but they will lose access
                                immediately.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setDeleteOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                Remove User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </PageMotion>
        </AdminLayout>
    );
}
