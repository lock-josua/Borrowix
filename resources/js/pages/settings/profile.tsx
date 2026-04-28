import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';
import * as React from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
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
import AdminLayout from '@/layouts/AdminLayout';
import SettingsLayout from '@/layouts/settings/layout';
import StaffLayout from '@/layouts/StaffLayout';
import StudentLayout from '@/layouts/StudentLayout';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import { send } from '@/routes/verification';
import type { BreadcrumbItem } from '@/types';

export default function Profile({
    mustVerifyEmail,
}: {
    mustVerifyEmail: boolean;
}) {
    const { auth } = usePage().props;

    const Layout = (() => {
        switch (auth.user.role) {
            case 'admin':
                return AdminLayout;
            case 'super_admin':
                return SuperAdminLayout;
            case 'staff':
                return StaffLayout;
            case 'student':
                return StudentLayout;
            default:
                return AdminLayout;
        }
    })();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Settings', href: '/settings/profile' },
        { title: 'Profile', href: '/settings/profile' },
    ];

    const editMode = useEditMode();

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <Head title="Profile" />

            <SettingsLayout>
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="text-sm font-semibold">
                            Profile Information
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Update your account's profile information and email
                            address.
                        </CardDescription>
                    </CardHeader>
                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                            onSuccess: () => editMode.stopEditing(),
                        }}
                    >
                        {({
                            processing,
                            recentlySuccessful,
                            errors,
                            data,
                            setData,
                            reset,
                        }) => (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!editMode.isEditing) {
                                        editMode.startEditing();
                                        return;
                                    }
                                }}
                            >
                                <CardContent className="space-y-5 pt-6 pb-6">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            required
                                            autoComplete="name"
                                            disabled={!editMode.isEditing}
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
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            required
                                            autoComplete="username"
                                            disabled={!editMode.isEditing}
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-destructive">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {mustVerifyEmail &&
                                        auth.user.email_verified_at ===
                                            null && (
                                            <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                                                <p className="text-xs text-amber-700">
                                                    Your email is unverified.{' '}
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="font-bold underline"
                                                    >
                                                        Resend verification
                                                    </Link>
                                                </p>
                                            </div>
                                        )}
                                </CardContent>
                                <CardFooter className="flex items-center justify-between border-t bg-muted/30 py-3">
                                    <div className="flex items-center gap-4">
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

                                        {editMode.isEditing && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    editMode.stopEditing();
                                                    reset();
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        size="sm"
                                        onClick={(e) => {
                                            if (!editMode.isEditing) {
                                                e.preventDefault();
                                                editMode.startEditing();
                                            }
                                        }}
                                    >
                                        {processing
                                            ? 'Saving...'
                                            : editMode.isEditing
                                              ? 'Save Profile'
                                              : 'Edit Profile'}
                                    </Button>
                                </CardFooter>
                            </form>
                        )}
                    </Form>
                </Card>

                <Card className="border-destructive/20">
                    <CardHeader className="border-b bg-destructive/[0.02]">
                        <CardTitle className="text-sm font-semibold text-destructive">
                            Danger Zone
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Once you delete your account, there is no going
                            back.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <DeleteUser />
                    </CardContent>
                </Card>
            </SettingsLayout>
        </Layout>
    );
}
