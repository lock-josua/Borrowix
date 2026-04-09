import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    Copy,
    Pencil,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface Credentials {
    admin_email: string;
    subdomain_url: string;
    login_url: string;
    reset_link: string;
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
    const { flash } = usePage().props as {
        flash?: { credentials?: Credentials };
    };
    const [showCredentials, setShowCredentials] = useState(
        !!flash?.credentials,
    );
    const [credentials, setCredentials] = useState<Credentials | null>(() => {
        if (flash?.credentials) return flash.credentials;
        return null;
    });
    const [copied, setCopied] = useState<string | null>(null);
    const [showSuspend, setShowSuspend] = useState(false);
    const [suspendReason, setSuspendReason] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/super-admin/dashboard' },
        { title: 'Schools', href: '/super-admin/schools' },
        { title: school.name, href: `/super-admin/schools/${school.id}` },
    ];

    function handleReactivate() {
        router.post(`/super-admin/schools/${school.id}/reactivate`);
    }

    function handleResendCredentials() {
        router.post(`/super-admin/schools/${school.id}/resend-credentials`);
    }

    function handleSuspend() {
        router.post(
            `/super-admin/schools/${school.id}/suspend`,
            { reason: suspendReason },
            {
                onSuccess: () => {
                    setShowSuspend(false);
                    setSuspendReason('');
                },
            },
        );
    }

    function handleCopy(value: string, key: string) {
        navigator.clipboard.writeText(value);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
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
                        <Link href={`/super-admin/schools/${school.id}/edit`}>
                            <Button variant="outline">
                                <Pencil className="mr-2 size-4" />
                                Edit
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            onClick={handleResendCredentials}
                        >
                            <RefreshCw className="mr-2 size-4" />
                            Resend Credentials
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
                            <Button
                                variant="destructive"
                                onClick={() => setShowSuspend(true)}
                            >
                                <ShieldAlert className="mr-2 size-4" />
                                Suspend
                            </Button>
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

            {/* Credentials Dialog */}
            <Dialog
                open={showCredentials}
                onOpenChange={(open) => {
                    setShowCredentials(open);
                    if (!open) setCredentials(null);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>School Credentials</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Share these credentials with the school.
                    </p>
                    {credentials && (
                        <div className="space-y-3">
                            <CredentialField
                                label="Admin Email"
                                value={credentials.admin_email}
                                copied={copied === 'email'}
                                onCopy={() =>
                                    handleCopy(credentials.admin_email, 'email')
                                }
                            />
                            <CredentialField
                                label="School URL"
                                value={credentials.subdomain_url}
                                copied={copied === 'subdomain'}
                                onCopy={() =>
                                    handleCopy(
                                        credentials.subdomain_url,
                                        'subdomain',
                                    )
                                }
                            />
                            <CredentialField
                                label="Login URL"
                                value={credentials.login_url}
                                copied={copied === 'login'}
                                onCopy={() =>
                                    handleCopy(credentials.login_url, 'login')
                                }
                            />
                            <CredentialField
                                label="Password Setup Link"
                                value={credentials.reset_link}
                                copied={copied === 'reset'}
                                onCopy={() =>
                                    handleCopy(credentials.reset_link, 'reset')
                                }
                                note="Link expires in 60 minutes."
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setShowCredentials(false)}>
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Suspend Dialog */}
            <Dialog
                open={showSuspend}
                onOpenChange={(open) => {
                    setShowSuspend(open);
                    if (!open) setSuspendReason('');
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Suspend School</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        This will immediately log out all users at{' '}
                        <strong>{school.name}</strong> and block access to their
                        portal.
                    </p>
                    <div className="space-y-1">
                        <Label>
                            Reason <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            placeholder="e.g. Non-payment of subscription"
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowSuspend(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleSuspend}
                            disabled={!suspendReason.trim()}
                        >
                            Confirm Suspend
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SuperAdminLayout>
    );
}

function CredentialField({
    label,
    value,
    copied,
    onCopy,
    note,
}: {
    label: string;
    value: string;
    copied: boolean;
    onCopy: () => void;
    note?: string;
}) {
    return (
        <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">
                {label}
            </div>
            <div className="flex items-center gap-2">
                <div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 font-mono text-xs break-all">
                    {value}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={onCopy}
                >
                    {copied ? (
                        <Check className="size-3.5 text-emerald-600" />
                    ) : (
                        <Copy className="size-3.5" />
                    )}
                </Button>
            </div>
            {note && <p className="text-xs text-muted-foreground">{note}</p>}
        </div>
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
