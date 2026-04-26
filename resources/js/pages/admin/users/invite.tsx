import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { FormField } from '@/components/form-field';
import { PageHeader } from '@/components/page-header';
import { PageMotion } from '@/components/page-motion';
import { Button } from '@/components/ui/button';
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

            <PageMotion>
                <PageHeader
                    title="Add User"
                    description="Invite a new staff member or student to your school"
                    actions={
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/users" className="gap-1.5">
                                <ArrowLeft className="size-3.5" /> Back
                            </Link>
                        </Button>
                    }
                />

                <div className="max-w-md">
                    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        <div className="border-b border-border bg-muted/5 px-6 py-4">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <UserPlus className="size-4 text-muted-foreground" />
                                User Details
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-5 px-6 py-5">
                                <FormField label="Full Name" required>
                                    <Input
                                        placeholder="e.g. Juan dela Cruz"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        className="h-9 transition-shadow duration-150 focus:ring-2 focus:ring-ring/30"
                                        autoFocus
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
                                        placeholder="e.g. juan@school.edu.ph"
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

                                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-800/30 dark:bg-blue-900/20">
                                    <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">
                                        The invited user will receive an email
                                        invitation to set up their account
                                        password and access the portal.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-border bg-muted/20 px-6 py-4">
                                <Button
                                    variant="outline"
                                    type="button"
                                    asChild
                                    size="sm"
                                >
                                    <Link href="/admin/users">Cancel</Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    size="sm"
                                >
                                    {processing ? 'Adding...' : 'Add User'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </PageMotion>
        </AdminLayout>
    );
}
