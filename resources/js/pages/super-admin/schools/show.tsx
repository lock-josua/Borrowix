import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ShieldAlert, ShieldCheck, UserCog } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

interface School {
    id: string;
    name: string;
    email: string;
    address: string;
    contact_number: string;
    plan: string;
    status: string;
    suspension_reason: string | null;
    subdomain: string | null;
    school_url: string | null;
    created_at: string;
    users_count: number;
    equipment_count: number;
    borrow_requests_count: number;
    borrow_transactions_count: number;
}

interface Props {
    school: School;
    subscription: {
        plan: string;
        status: string;
        billing_cycle: string;
        current_period_end: string;
        card_brand: string | null;
        card_last_four: string | null;
    } | null;
}

const statusBadge: Record<string, string> = {
    active: 'badge-success',
    suspended: 'badge-error',
    canceled: 'badge-neutral',
};

const planBadge: Record<string, string> = {
    free: 'badge-ghost',
    basic: 'badge-info',
    pro: 'badge-warning',
};

export default function SchoolShow({ school, subscription }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/super-admin/dashboard' },
        { title: 'Schools', href: '/super-admin/schools' },
        { title: school.name, href: `/super-admin/schools/${school.id}` },
    ];

    function handleReactivate() {
        router.post(`/super-admin/schools/${school.id}/reactivate`);
    }

    function handleImpersonate() {
        router.post(`/super-admin/schools/${school.id}/impersonate`);
    }

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title={school.name} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/super-admin/schools">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {school.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {school.email}
                            </p>
                        </div>
                        <span
                            className={`badge capitalize ${statusBadge[school.status]}`}
                        >
                            {school.status}
                        </span>
                        <span
                            className={`badge capitalize ${planBadge[school.plan]}`}
                        >
                            {school.plan}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleImpersonate}>
                            <UserCog className="mr-2 size-4" />
                            Impersonate
                        </Button>
                        {school.status === 'suspended' ? (
                            <Button
                                variant="default"
                                onClick={handleReactivate}
                            >
                                <ShieldCheck className="mr-2 size-4" />
                                Reactivate
                            </Button>
                        ) : (
                            <Link href={`/super-admin/schools/${school.id}`}>
                                <Button variant="destructive">
                                    <ShieldAlert className="mr-2 size-4" />
                                    Suspend
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Users', value: school.users_count },
                        { label: 'Equipment', value: school.equipment_count },
                        {
                            label: 'Requests',
                            value: school.borrow_requests_count,
                        },
                        {
                            label: 'Transactions',
                            value: school.borrow_transactions_count,
                        },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold">
                                    {s.value}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {s.label}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* School Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                School Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {/* Add domain link BEFORE Address */}
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">
                                    Domain
                                </span>
                                <span className="font-medium">
                                    {school.school_url ? (
                                        <a
                                            href={school.school_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary underline hover:opacity-80"
                                        >
                                            {school.subdomain}.localhost
                                        </a>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            —
                                        </span>
                                    )}
                                </span>
                            </div>
                            <InfoRow
                                label="Address"
                                value={school.address ?? '—'}
                            />
                            <InfoRow
                                label="Contact"
                                value={school.contact_number ?? '—'}
                            />
                            <InfoRow
                                label="Registered"
                                value={new Date(
                                    school.created_at,
                                ).toLocaleDateString()}
                            />
                            {school.suspension_reason && (
                                <InfoRow
                                    label="Suspension Reason"
                                    value={school.suspension_reason}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Subscription Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Subscription
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {subscription ? (
                                <>
                                    <InfoRow
                                        label="Plan"
                                        value={subscription.plan}
                                    />
                                    <InfoRow
                                        label="Status"
                                        value={subscription.status}
                                    />
                                    <InfoRow
                                        label="Billing"
                                        value={subscription.billing_cycle}
                                    />
                                    <InfoRow
                                        label="Renews"
                                        value={
                                            subscription.current_period_end
                                                ? new Date(
                                                      subscription.current_period_end,
                                                  ).toLocaleDateString()
                                                : '—'
                                        }
                                    />
                                    <InfoRow
                                        label="Payment"
                                        value={
                                            subscription.card_last_four
                                                ? `${subscription.card_brand} •••• ${subscription.card_last_four}`
                                                : 'No payment method'
                                        }
                                    />
                                </>
                            ) : (
                                <p className="text-muted-foreground">
                                    No subscription on file.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SuperAdminLayout>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between border-b pb-2 last:border-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium capitalize">{value}</span>
        </div>
    );
}
