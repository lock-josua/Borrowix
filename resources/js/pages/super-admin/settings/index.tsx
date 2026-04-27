import { Transition } from '@headlessui/react';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
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
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

interface Props {
    user: {
        name: string;
        email: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
    { title: 'Settings', href: '/super-admin/settings' },
];

export default function SuperAdminSettingsIndex({ user }: Props) {
    const { data, setData, patch, processing, errors, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
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
        patch('/super-admin/settings/profile', {
            preserveScroll: true,
        });
    }

    function handlePasswordSubmit(event: React.FormEvent) {
        event.preventDefault();
        put('/super-admin/settings/password', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <div className="flex flex-col gap-6 p-6">
                <PageHeader
                    title="Settings"
                    description="Manage your account settings."
                />

                <nav className="border-b border-border">
                    <ul className="flex items-center gap-6">
                        <li className="border-b-2 border-primary pb-2 text-sm font-semibold text-foreground">
                            Profile
                        </li>
                        <li>
                            <Link
                                href="/super-admin/settings/updates"
                                className="inline-flex border-b-2 border-transparent pb-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Updates
                            </Link>
                        </li>
                    </ul>
                </nav>

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

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing && (
                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                            )}
                                            Save
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
                                        <Button
                                            type="submit"
                                            disabled={passwordProcessing}
                                        >
                                            {passwordProcessing && (
                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                            )}
                                            Change Password
                                        </Button>
                                    </CardFooter>
                                </form>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
