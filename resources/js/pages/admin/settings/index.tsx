import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

interface School {
    name: string;
    email: string;
    contact_number: string;
    address: string;
}

interface Props {
    school: School;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Settings', href: '/admin/settings' },
];

export default function SettingsIndex({ school }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name: school.name,
        email: school.email,
        contact_number: school.contact_number,
        address: school.address,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        patch('/admin/settings');
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <div className="flex flex-col gap-6 p-6">
                <h1 className="text-2xl font-bold">School Settings</h1>

                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="text-base">
                            School Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label>School Name</Label>
                                <Input
                                    placeholder="Enter school name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    placeholder="school@edu.ph"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label>Contact Number</Label>
                                <Input
                                    placeholder="+63 900 000 0000"
                                    value={data.contact_number}
                                    onChange={(e) =>
                                        setData(
                                            'contact_number',
                                            e.target.value,
                                        )
                                    }
                                />
                                {errors.contact_number && (
                                    <p className="text-xs text-destructive">
                                        {errors.contact_number}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label>Address</Label>
                                <Input
                                    placeholder="Enter school address"
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                />
                                {errors.address && (
                                    <p className="text-xs text-destructive">
                                        {errors.address}
                                    </p>
                                )}
                            </div>
                            <div className="pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
