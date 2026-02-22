import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Settings', href: '/admin/settings' },
];

interface School {
    id: number;
    name: string;
    email: string;
    address: string | null;
    contact_number: string | null;
}

interface Props { school: School; }

export default function SettingsIndex({ school }: Props) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: school.name,
        email: school.email,
        address: school.address ?? '',
        contact_number: school.contact_number ?? '',
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

                <Card className="max-w-lg">
                    <CardHeader><CardTitle className="text-base">School Information</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Field label="School Name" error={errors.name}>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            </Field>
                            <Field label="Email" error={errors.email}>
                                <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                            </Field>
                            <Field label="Address" error={errors.address}>
                                <Input value={data.address} onChange={(e) => setData('address', e.target.value)} />
                            </Field>
                            <Field label="Contact Number" error={errors.contact_number}>
                                <Input value={data.contact_number} onChange={(e) => setData('contact_number', e.target.value)} />
                            </Field>
                            <div className="flex items-center gap-4 pt-2">
                                <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save Changes'}</Button>
                                {recentlySuccessful && <p className="text-sm text-green-600">Saved!</p>}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}