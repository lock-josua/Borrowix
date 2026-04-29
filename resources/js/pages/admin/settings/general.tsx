import { Head, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useEditMode } from '@/hooks/use-edit-mode';
import AdminSettingsLayout from '@/layouts/admin/AdminSettingsLayout';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

interface GeneralSettings {
    name: string;
    email: string;
    contact_number: string;
    address: string;
}

interface FormData {
    name: string;
    email: string;
    contact_number: string;
    address: string;
}

interface Props {
    general: GeneralSettings;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Settings', href: '/admin/settings/general' },
];

export default function GeneralSettingsPage({ general }: Props) {
    const editMode = useEditMode();

    const { data, setData, patch, processing, errors } = useForm<FormData>({
        name: general.name,
        email: general.email,
        contact_number: general.contact_number,
        address: general.address,
    });

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!editMode.isEditing) {
            editMode.startEditing();
            return;
        }

        patch('/admin/settings/general', {
            preserveScroll: true,
            onSuccess: () => editMode.stopEditing(),
        });
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <div className="flex flex-col gap-6 p-6">
                <AdminSettingsLayout>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">
                                General Settings
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Configure your school profile and borrowing
                                defaults.
                            </CardDescription>
                        </CardHeader>

                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-5 pt-4 pb-6">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name">School Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                        disabled={!editMode.isEditing}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="email">School Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(event) =>
                                            setData('email', event.target.value)
                                        }
                                        disabled={!editMode.isEditing}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="contact_number">
                                        Contact Number
                                    </Label>
                                    <Input
                                        id="contact_number"
                                        value={data.contact_number}
                                        onChange={(event) =>
                                            setData(
                                                'contact_number',
                                                event.target.value,
                                            )
                                        }
                                        disabled={!editMode.isEditing}
                                    />
                                    {errors.contact_number && (
                                        <p className="text-xs text-destructive">
                                            {errors.contact_number}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={(event) =>
                                            setData(
                                                'address',
                                                event.target.value,
                                            )
                                        }
                                        disabled={!editMode.isEditing}
                                    />
                                    {errors.address && (
                                        <p className="text-xs text-destructive">
                                            {errors.address}
                                        </p>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter className="justify-end border-t bg-muted/20 py-3">
                                <div className="flex items-center gap-4">
                                    {editMode.isEditing && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                editMode.stopEditing();
                                                setData({
                                                    name: general.name,
                                                    email: general.email,
                                                    contact_number:
                                                        general.contact_number,
                                                    address: general.address,
                                                });
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    <Button type="submit" disabled={processing}>
                                        {processing && (
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                        )}
                                        {editMode.isEditing ? 'Save' : 'Edit'}
                                    </Button>
                                </div>
                            </CardFooter>
                        </form>
                    </Card>
                </AdminSettingsLayout>
            </div>
        </AdminLayout>
    );
}
