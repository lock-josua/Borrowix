import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
    { title: 'Schools', href: '/super-admin/schools' },
    { title: 'Add School', href: '/super-admin/schools/create' },
];

export default function CreateSchool() {
    const { data, setData, post, processing, errors } = useForm({
        school_name: '',
        admin_name: '',
        admin_email: '',
        contact_number: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/super-admin/schools');
    }

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Add School" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-3">
                    <Link href="/super-admin/schools">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Add School</h1>
                        <p className="text-sm text-muted-foreground">
                            Create a new school tenant with an admin account.
                        </p>
                    </div>
                </div>

                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle className="text-base">
                            School Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label>School Name</Label>
                                <Input
                                    placeholder="e.g. Demo School"
                                    value={data.school_name}
                                    onChange={(e) =>
                                        setData('school_name', e.target.value)
                                    }
                                    autoFocus
                                />
                                {errors.school_name && (
                                    <p className="text-xs text-destructive">
                                        {errors.school_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label>Admin Name</Label>
                                <Input
                                    placeholder="Full name of the school admin"
                                    value={data.admin_name}
                                    onChange={(e) =>
                                        setData('admin_name', e.target.value)
                                    }
                                />
                                {errors.admin_name && (
                                    <p className="text-xs text-destructive">
                                        {errors.admin_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label>Admin Email</Label>
                                <Input
                                    type="email"
                                    placeholder="admin@school.edu"
                                    value={data.admin_email}
                                    onChange={(e) =>
                                        setData('admin_email', e.target.value)
                                    }
                                />
                                {errors.admin_email && (
                                    <p className="text-xs text-destructive">
                                        {errors.admin_email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label>
                                    Contact Number{' '}
                                    <span className="text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>
                                <Input
                                    placeholder="+63 912 345 6789"
                                    value={data.contact_number}
                                    onChange={(e) =>
                                        setData(
                                            'contact_number',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Creating...'
                                        : 'Create School'}
                                </Button>
                                <Link href="/super-admin/schools">
                                    <Button variant="outline" type="button">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
