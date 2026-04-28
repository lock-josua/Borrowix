import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';
import * as React from 'react';
import { useRef } from 'react';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
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
import SettingsLayout from '@/layouts/settings/layout';

import { useEditMode } from '@/hooks/use-edit-mode';

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const editMode = useEditMode();

    return (
        <SettingsLayout>
            <Head title="Password" />

            <Card>
                <CardHeader className="border-b">
                    <CardTitle className="text-sm font-semibold">
                        Update Password
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Ensure your account is using a long, random password to
                        stay secure.
                    </CardDescription>
                </CardHeader>
                <Form
                    {...PasswordController.update.form()}
                    options={{
                        preserveScroll: true,
                        onSuccess: () => editMode.stopEditing(),
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) passwordInput.current?.focus();
                        if (errors.current_password)
                            currentPasswordInput.current?.focus();
                    }}
                >
                    {({
                        errors,
                        processing,
                        recentlySuccessful,
                        data,
                        setData,
                        reset,
                    }) => (
                        <form
                            onSubmit={(e) => {
                                if (!editMode.isEditing) {
                                    e.preventDefault();
                                    editMode.startEditing();
                                }
                            }}
                        >
                            <CardContent className="space-y-5 pt-6 pb-6">
                                <div className="space-y-1.5">
                                    <Label htmlFor="current_password">
                                        Current Password
                                    </Label>
                                    <Input
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        type="password"
                                        value={data.current_password}
                                        onChange={(e) =>
                                            setData(
                                                'current_password',
                                                e.target.value,
                                            )
                                        }
                                        autoComplete="current-password"
                                        disabled={!editMode.isEditing}
                                    />
                                    {errors.current_password && (
                                        <p className="text-xs text-destructive">
                                            {errors.current_password}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password">
                                        New Password
                                    </Label>
                                    <Input
                                        id="password"
                                        ref={passwordInput}
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        autoComplete="new-password"
                                        disabled={!editMode.isEditing}
                                    />
                                    {errors.password && (
                                        <p className="text-xs text-destructive">
                                            {errors.password}
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
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        autoComplete="new-password"
                                        disabled={!editMode.isEditing}
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-xs text-destructive">
                                            {errors.password_confirmation}
                                        </p>
                                    )}
                                </div>
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
                                            Updated
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
                                          ? 'Update Password'
                                          : 'Edit Password'}
                                </Button>
                            </CardFooter>
                        </form>
                    )}
                </Form>
            </Card>
        </SettingsLayout>
    );
}
