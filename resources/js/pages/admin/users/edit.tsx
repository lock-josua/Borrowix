import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, UserCog } from 'lucide-react';
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

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Props {
    user: User;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Users', href: '/admin/users' },
    { title: 'Edit User', href: '/admin/users/{user}/edit' },
];

export default function EditUser({ user }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        patch(`/admin/users/${user.id}`);
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />

            <PageMotion>
                <PageHeader
                    title="Edit User"
                    description="Update user details and role"
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
                                <UserCog className="size-4 text-muted-foreground" />
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
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </PageMotion>
        </AdminLayout>
    );
}
