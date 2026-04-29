import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle, Loader2 } from 'lucide-react';
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

interface Props {
    admin: {
        name: string;
        email: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Settings', href: '/admin/settings/school' },
];

export default function SchoolSettingsPage({ admin }: Props) {
    const profileEdit = useEditMode();
    const passwordEdit = useEditMode();

    const { data, setData, patch, processing, errors, recentlySuccessful } =
        useForm({
            name: admin.name,
            email: admin.email,
        });

    const {
        data: passwordData,
        setData: setPasswordData,
        put,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function handleProfileSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!profileEdit.isEditing) {
            profileEdit.startEditing();
            return;
        }

        patch('/admin/settings/school', {
            preserveScroll: true,
            onSuccess: () => profileEdit.stopEditing(),
        });
    }

    function handlePasswordSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!passwordEdit.isEditing) {
            passwordEdit.startEditing();
            return;
        }

        put('/admin/settings/password', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                passwordEdit.stopEditing();
            },
        });
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <AdminSettingsLayout>
                <div className="space-y-6">
                    <Card className="overflow-hidden">
                        <div className="grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
                            {/* Profile Column */}
                            <div className="flex flex-col">
                                <CardHeader className="border-b">
                                    <CardTitle className="text-sm font-semibold">
                                        Profile Information
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Update your account profile information.
                                    </CardDescription>
                                </CardHeader>

                                <form
                                    onSubmit={handleProfileSubmit}
                                    className="flex flex-1 flex-col"
                                >
                                    <CardContent className="flex-1 space-y-5 pt-6 pb-6">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="name">
                                                Full Name
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(event) =>
                                                    setData(
                                                        'name',
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={
                                                    !profileEdit.isEditing
                                                }
                                            />
                                            {errors.name && (
                                                <p className="text-xs text-destructive">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="email">
                                                Email Address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(event) =>
                                                    setData(
                                                        'email',
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={
                                                    !profileEdit.isEditing
                                                }
                                            />
                                            {errors.email && (
                                                <p className="text-xs text-destructive">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="mt-auto flex items-center justify-end gap-4 border-t bg-muted/20 py-3">
                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="flex items-center gap-1 text-xs text-emerald-600">
                                                <CheckCircle className="size-3" />{' '}
                                                Saved
                                            </p>
                                        </Transition>

                                        {profileEdit.isEditing && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    profileEdit.stopEditing();
                                                    setData({
                                                        name: admin.name,
                                                        email: admin.email,
                                                    });
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        )}

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing && (
                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                            )}
                                            {profileEdit.isEditing
                                                ? 'Save'
                                                : 'Edit'}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </div>

                            {/* Password Column */}
                            <div className="flex flex-col">
                                <CardHeader className="border-b">
                                    <CardTitle className="text-sm font-semibold">
                                        Change Password
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Ensure your account stays secure with a
                                        strong password.
                                    </CardDescription>
                                </CardHeader>

                                <form
                                    onSubmit={handlePasswordSubmit}
                                    className="flex flex-1 flex-col"
                                >
                                    <CardContent className="flex-1 space-y-5 pt-6 pb-6">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="current_password">
                                                Current Password
                                            </Label>
                                            <Input
                                                id="current_password"
                                                type="password"
                                                value={
                                                    passwordData.current_password
                                                }
                                                onChange={(event) =>
                                                    setPasswordData(
                                                        'current_password',
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={
                                                    !passwordEdit.isEditing
                                                }
                                            />
                                            {passwordErrors.current_password && (
                                                <p className="text-xs text-destructive">
                                                    {
                                                        passwordErrors.current_password
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="password">
                                                New Password
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={passwordData.password}
                                                onChange={(event) =>
                                                    setPasswordData(
                                                        'password',
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={
                                                    !passwordEdit.isEditing
                                                }
                                            />
                                            {passwordErrors.password && (
                                                <p className="text-xs text-destructive">
                                                    {passwordErrors.password}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="password_confirmation">
                                                Confirm Password
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={
                                                    passwordData.password_confirmation
                                                }
                                                onChange={(event) =>
                                                    setPasswordData(
                                                        'password_confirmation',
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={
                                                    !passwordEdit.isEditing
                                                }
                                            />
                                            {passwordErrors.password_confirmation && (
                                                <p className="text-xs text-destructive">
                                                    {
                                                        passwordErrors.password_confirmation
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="mt-auto justify-end border-t bg-muted/20 py-3">
                                        {passwordEdit.isEditing && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    passwordEdit.stopEditing();
                                                    reset();
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        )}

                                        <Button
                                            type="submit"
                                            disabled={passwordProcessing}
                                        >
                                            {passwordProcessing && (
                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                            )}
                                            {passwordEdit.isEditing
                                                ? 'Change Password'
                                                : 'Edit Password'}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </div>
                        </div>
                    </Card>
                </div>
            </AdminSettingsLayout>
        </AdminLayout>
    );
}
