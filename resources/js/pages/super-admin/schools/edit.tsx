import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

interface School {
    id: string;
    name: string;
    email: string;
    contact_number: string;
    address: string;
}

interface Props {
    school: School;
}

export default function EditSchool({ school }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name: school.name,
        email: school.email,
        contact_number: school.contact_number,
        address: school.address,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/super-admin/dashboard' },
        { title: 'Schools', href: '/super-admin/schools' },
        {
            title: school.name || 'Edit',
            href: `/super-admin/schools/${school.id}`,
        },
        { title: 'Edit', href: '' },
    ];

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        patch(`/super-admin/schools/${school.id}`);
    }

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${school.name}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-3">
                    <Link href={`/super-admin/schools/${school.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Edit School</h1>
                        <p className="text-sm text-muted-foreground">
                            School ID: {school.id}
                        </p>
                    </div>
                </div>

                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle className="text-base">
                            School Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label>
                                    School Name{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
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
                                <Label>
                                    Email{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    type="email"
                                    placeholder="school@example.com"
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
                                {errors.contact_number && (
                                    <p className="text-xs text-destructive">
                                        {errors.contact_number}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label>
                                    Address{' '}
                                    <span className="text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>
                                <Input
                                    placeholder="Enter address"
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

                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Updating...'
                                        : 'Update School'}
                                </Button>
                                <Link
                                    href={`/super-admin/schools/${school.id}`}
                                >
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
