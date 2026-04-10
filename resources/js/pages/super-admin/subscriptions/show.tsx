import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, HelpCircle, Loader2, Receipt } from 'lucide-react';
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

interface SchoolSubscription {
    plan: string;
    status: string;
    billing_cycle: string;
    current_period_start: string | null;
    current_period_end: string | null;
    trial_ends_at: string | null;
    canceled_at: string | null;
    grace_period_ends_at: string | null;
    discount_amount: string;
    card_brand: string | null;
    card_last_four: string | null;
    promo_code: {
        code: string;
        discount_type: string;
        discount_value: number;
    } | null;
}

interface School {
    id: number;
    name: string;
    email: string;
    plan: string;
    status: string;
    subscription: SchoolSubscription | null;
}

interface PaymentRecord {
    plan: string;
    status: string;
    billing_cycle: string;
    current_period_start: string | null;
    current_period_end: string | null;
    created_at: string;
}

interface SubscriptionData {
    plan: string;
    status: string;
    billing_cycle: string;
}

interface Props {
    school: School;
    subscription: SubscriptionData | null;
    paymentHistory: PaymentRecord[];
}

export default function SubscriptionShow({
    school,
    subscription,
    paymentHistory,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/super-admin/dashboard' },
        { title: 'Subscriptions', href: '/super-admin/subscriptions' },
        { title: school.name, href: `/super-admin/subscriptions/${school.id}` },
    ];

    const sub = school.subscription;

    const { data, setData, patch, processing } = useForm({
        plan: subscription?.plan ?? 'free',
        status: subscription?.status ?? 'active',
        billing_cycle: subscription?.billing_cycle ?? 'monthly',
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
                            <StatusBadge status={school.plan} />
                            <StatusBadge status={school.status} />
                        </div>
                    }
                />

                <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="flex flex-1 flex-col gap-6">
                        {/* Current Subscription */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-base">Current Subscription</CardTitle>
                                {!sub && (
                                    <span className="text-xs text-muted-foreground">
                                        No subscription
                                    </span>
                                )}
                            </CardHeader>
                            <CardContent>
                                {sub ? (
                                    <div className="space-y-3 text-sm">
                                        <Row label="Plan">
                                            <StatusBadge status={sub.plan} />
                                        </Row>
                                        <Row label="Status">
                                            <StatusBadge status={sub.status} />
                                        </Row>
                                        <Row label="Billing">
                                            <span className="capitalize">
                                                {sub.billing_cycle ?? '—'}
                                            </span>
                                        </Row>
                                        <Row label="Period">
                                            <span className="text-muted-foreground">
                                                {sub.current_period_start
                                                    ? `${new Date(sub.current_period_start).toLocaleDateString()} → ${sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '—'}`
                                                    : '—'}
                                            </span>
                                        </Row>
                                        {sub.promo_code && (
                                            <Row label="Promo">
                                                <span className="font-mono text-xs">
                                                    {sub.promo_code.code}
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

                        {/* Subscription History */}
                        <Card className="overflow-hidden border-border/60 p-0">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border px-4 py-3">
                                <CardTitle className="text-sm font-semibold">
                                    Subscription History
                                </CardTitle>
                                <span className="text-xs text-muted-foreground">
                                    {paymentHistory.length} record
                                    {paymentHistory.length !== 1 ? 's' : ''}
                                </span>
                            </CardHeader>
                            <CardContent className="p-0">
                                {paymentHistory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="mb-3 rounded-full bg-muted p-3">
                                            <Receipt className="size-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            No history available.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="w-full overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/30 hover:bg-muted/30">
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                        Plan
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                        Cycle
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                        Period
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {paymentHistory.map((h, i) => (
                                                    <tr
                                                        key={i}
                                                        className="border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                                                    >
                                                        <td className="px-4 py-3">
                                                            <StatusBadge status={h.plan} />
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <StatusBadge status={h.status} />
                                                        </td>
                                                        <td className="px-4 py-3 text-center capitalize text-muted-foreground">
                                                            {h.billing_cycle ?? '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                                            {h.current_period_start
                                                                ? `${new Date(h.current_period_start).toLocaleDateString()} → ${h.current_period_end ? new Date(h.current_period_end).toLocaleDateString() : '—'}`
                                                                : '—'}
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
                        {/* Update Subscription */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Update Subscription</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Plan</Label>
                                        <Select
                                            value={data.plan}
                                            onValueChange={(v) => setData('plan', v)}
                                        >
                                            <SelectTrigger className="h-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="free">Free</SelectItem>
                                                <SelectItem value="basic">Basic</SelectItem>
                                                <SelectItem value="pro">Pro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
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
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="trialing">Trialing</SelectItem>
                                                <SelectItem value="past_due">Past Due</SelectItem>
                                                <SelectItem value="canceled">Canceled</SelectItem>
                                                <SelectItem value="paused">Paused</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Billing cycle</Label>
                                    <Select
                                        value={data.billing_cycle}
                                        onValueChange={(v) => setData('billing_cycle', v)}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="annual">Annual</SelectItem>
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

                        {/* Payment Method */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Payment Method</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {sub?.card_last_four ? (
                                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                                        <div className="flex h-10 w-14 items-center justify-center rounded bg-muted text-xs font-bold uppercase">
                                            {sub.card_brand ?? 'CARD'}
                                        </div>
                                        <div>
                                            <p className="font-mono text-sm font-medium">
                                                •••• {sub.card_last_four}
                                            </p>
                                            <p className="text-xs capitalize text-muted-foreground">
                                                {sub.card_brand}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-8 text-center">
                                        <CreditCard className="mb-2 size-6 text-muted-foreground" />
                                        <p className="mb-3 text-sm text-muted-foreground">
                                            No payment method on file.
                                        </p>
                                        <Button variant="outline" size="sm">
                                            + Add payment method
                                        </Button>
                                    </div>
                                )}
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
