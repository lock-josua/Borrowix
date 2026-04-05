import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface Props { user: User; }

export default function UserShow({ user }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Users', href: '/admin/users' },
        { title: user.name, href: `/admin/users/${user.id}` },
    ];

    const [deleteOpen, setDeleteOpen] = useState(false);

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name:  user.name,
        email: user.email,
        role:  user.role,
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

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/users">
                            <Button variant="ghost" size="icon"><ArrowLeft className="size-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{user.name}</h1>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <span className={`badge capitalize ${user.role === 'staff' ? 'badge-info' : 'badge-ghost'}`}>
                            {user.role}
                        </span>
                        {user.email_verified_at ? (
                            <span className="badge badge-success badge-sm">Verified</span>
                        ) : (
                            <span className="badge badge-warning badge-sm">Unverified</span>
                        )}
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="mr-2 size-4" />Remove User
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label="Borrow Requests"  value={user.borrow_requests_count} />
                    <StatCard label="Transactions"     value={user.borrow_transactions_count} />
                    <StatCard label="Joined"           value={new Date(user.created_at).toLocaleDateString()} isText />
                    <StatCard label="Email Verified"   value={user.email_verified_at ? '✅ Yes' : '❌ No'} isText />
                </div>

                {/* Edit Form */}
                <Card className="max-w-md">
                    <CardHeader><CardTitle className="text-base">Edit User</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Field label="Full Name" error={errors.name}>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                            </Field>
                            <Field label="Email" error={errors.email}>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </Field>
                            <Field label="Role" error={errors.role}>
                                <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <div className="flex items-center gap-4 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                {recentlySuccessful && (
                                    <p className="text-sm text-green-600">Saved!</p>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Delete confirmation */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Remove {user.name}?</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        This will permanently remove <strong>{user.name}</strong> from your school.
                        Their borrowing history will be preserved.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Remove User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

function StatCard({ label, value, isText }: { label: string; value: string | number; isText?: boolean }) {
    return (
        <Card>
            <CardContent className="pt-4">
                <div className={isText ? 'text-base font-semibold' : 'text-3xl font-bold'}>{value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{label}</div>
            </CardContent>
        </Card>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}