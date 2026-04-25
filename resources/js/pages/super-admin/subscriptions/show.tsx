import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { HelpCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

interface School {
    id: string;
    name: string;
    email: string;
    status: string;
}

interface SubscriptionData {
    id: number;
    status: string;
    plan: string | null;
    paypal_subscription_id: string | null;
    trial_ends_at: string | null;
    trial_days_remaining: number;
    current_period_start: string | null;
    current_period_end: string | null;
    canceled_at: string | null;
    suspension_reason: string | null;
    trial_warning_sent: boolean;
}

interface Payment {
    id: number;
    plan: string;
    amount: number;
    currency: string;
    status: string;
    paid_at: string;
}

interface Props {
    school: School;
    subscription: SubscriptionData | null;
    payments: Payment[];
}

export default function SubscriptionShow({
    school,
    subscription,
    payments,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/super-admin/dashboard' },
        { title: 'Subscriptions', href: '/super-admin/subscriptions' },
        { title: school.name, href: `/super-admin/subscriptions/${school.id}` },
    ];

    const { data, setData, patch, processing } = useForm({
        status: subscription?.status ?? 'trialing',
        plan: subscription?.plan ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        patch(`/super-admin/subscriptions/${school.id}`);
    }

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`${school.name} — Subscription`} />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    backHref="/super-admin/subscriptions"
                    title={school.name}
                    description={school.email}
                    actions={
                        <div className="flex items-center gap-2">
                            <StatusBadge status={subscription?.status ?? 'trialing'} />
                        </div>
                    }
                />

                <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="flex flex-1 flex-col gap-6">
                        {/* Current Subscription */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-base">
                                    Current Subscription
                                </CardTitle>
                                {!subscription && (
                                    <span className="text-xs text-muted-foreground">
                                        No subscription
                                    </span>
                                )}
                            </CardHeader>
                            <CardContent>
                                {subscription ? (
                                    <div className="space-y-3 text-sm">
                                        <Row label="Plan">
                                            <span className="capitalize">
                                                {subscription.plan ?? 'Trial'}
                                            </span>
                                        </Row>
                                        <Row label="Status">
                                            <StatusBadge status={subscription.status} />
                                        </Row>
                                        {subscription.trial_ends_at && (
                                            <Row label="Trial Ends">
                                                <span className="text-muted-foreground">
                                                    {new Date(subscription.trial_ends_at).toLocaleDateString()}
                                                </span>
                                            </Row>
                                        )}
                                        {subscription.current_period_end && (
                                            <Row label="Next Billing">
                                                <span className="text-muted-foreground">
                                                    {new Date(subscription.current_period_end).toLocaleDateString()}
                                                </span>
                                            </Row>
                                        )}
                                        {subscription.paypal_subscription_id && (
                                            <Row label="PayPal ID">
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {subscription.paypal_subscription_id}
                                                </span>
                                            </Row>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <div className="mb-3 rounded-full bg-muted p-3">
                                            <HelpCircle className="size-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            No active subscription on record.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment History */}
                        <Card className="overflow-hidden border-border/60 p-0">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border px-4 py-3">
                                <CardTitle className="text-sm font-semibold">
                                    Payment History
                                </CardTitle>
                                <span className="text-xs text-muted-foreground">
                                    {payments.length} record{payments.length !== 1 ? 's' : ''}
                                </span>
                            </CardHeader>
                            <CardContent className="p-0">
                                {payments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            No payment history available.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="w-full overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/30 hover:bg-muted/30">
                                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                        Plan
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                        Amount
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                        Date
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {payments.map((p) => (
                                                    <tr
                                                        key={p.id}
                                                        className="border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                                                    >
                                                        <td className="px-4 py-3">
                                                            <span className="capitalize">{p.plan}</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            ₱{Number(p.amount).toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <StatusBadge status={p.status} />
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                                            {new Date(p.paid_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-6 lg:w-[380px]">
                        {/* Override Subscription */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Override Subscription
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(v) => setData('status', v)}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="trialing">
                                                Trialing
                                            </SelectItem>
                                            <SelectItem value="subscribed">
                                                Subscribed
                                            </SelectItem>
                                            <SelectItem value="trial_expired">
                                                Trial Expired
                                            </SelectItem>
                                            <SelectItem value="suspended">
                                                Suspended
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Plan</Label>
                                    <Select
                                        value={data.plan ?? ''}
                                        onValueChange={(v) => setData('plan', v)}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select plan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">
                                                Monthly
                                            </SelectItem>
                                            <SelectItem value="annually">
                                                Annually
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={processing}
                                    className="w-full"
                                >
                                    {processing && (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    )}
                                    {processing ? 'Updating...' : 'Update subscription'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </SuperAdminLayout>
    );
}

function Row({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between border-b border-border pb-2 last:border-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{children}</span>
        </div>
    );
}