import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Users', href: '/admin/users' },
    { title: 'Add User', href: '/admin/users/invite' },
];

export default function InviteUser() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        role: 'student',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/users/invite');
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Add User" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-3">
                    <Link href="/admin/users"><Button variant="ghost" size="icon"><ArrowLeft className="size-4" /></Button></Link>
                    <h1 className="text-2xl font-bold">Add User</h1>
                </div>

                <Card className="max-w-md">
                    <CardHeader><CardTitle className="text-base">User Details</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label>Full Name</Label>
                                <Input placeholder="Juan dela Cruz" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label>Email</Label>
                                <Input type="email" placeholder="juan@school.edu.ph" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label>Role</Label>
                                <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                            </div>
                            <p className="text-xs text-muted-foreground">Default password will be <code>password123</code>. User should change it on first login.</p>
                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={processing}>{processing ? 'Adding...' : 'Add User'}</Button>
                                <Link href="/admin/users"><Button variant="outline" type="button">Cancel</Button></Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}