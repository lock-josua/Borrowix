import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Loader2, Settings } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader title="School Settings" description="Update your institution's profile information." />

                <div className="max-w-2xl mx-auto w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Settings className="size-4" /> School Information
                            </CardTitle>
                            <CardDescription className="text-xs">These details will appear on official requests and reports.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-5 pt-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name">School Name</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Public Email</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="contact">Contact Number</Label>
                                    <Input id="contact" value={data.contact_number} onChange={(e) => setData('contact_number', e.target.value)} />
                                    {errors.contact_number && <p className="text-xs text-destructive">{errors.contact_number}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                                    {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end pt-4 border-t bg-muted/20">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 size-3.5 animate-spin" />}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </motion.div>
        </AdminLayout>
    );
}
