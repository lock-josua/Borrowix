import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    promo_code: { code: string; discount_type: string; discount_value: number } | null;
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

interface Props {
    school: School;
    paymentHistory: PaymentRecord[];
}

const planBadge: Record<string, string> = {
    free: 'badge-ghost',
    basic: 'badge-info',
    pro: 'badge-warning',
};

const statusBadge: Record<string, string> = {
    active: 'badge-success',
    canceled: 'badge-neutral',
    past_due: 'badge-error',
    trialing: 'badge-accent',
};

export default function SubscriptionShow({ school, paymentHistory }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/super-admin/dashboard' },
        { title: 'Subscriptions', href: '/super-admin/subscriptions' },
        { title: school.name, href: `/super-admin/subscriptions/${school.id}` },
    ];

    const sub = school.subscription;

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`${school.name} — Subscription`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/super-admin/subscriptions">
                        <Button variant="ghost" size="icon"><ArrowLeft className="size-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{school.name}</h1>
                        <p className="text-sm text-muted-foreground">{school.email}</p>
                    </div>
                    <span className={`badge capitalize ${planBadge[school.plan] ?? 'badge-ghost'}`}>{school.plan}</span>
                    <span className={`badge capitalize ${school.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                        {school.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Active Subscription Details */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Current Subscription</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {sub ? (
                                <>
                                    <Row label="Plan">
                                        <span className={`badge badge-sm capitalize ${planBadge[sub.plan] ?? 'badge-ghost'}`}>
                                            {sub.plan}
                                        </span>
                                    </Row>
                                    <Row label="Status">
                                        <span className={`badge badge-sm capitalize ${statusBadge[sub.status] ?? 'badge-ghost'}`}>
                                            {sub.status.replace('_', ' ')}
                                        </span>
                                    </Row>
                                    <Row label="Billing Cycle">
                                        <span className="capitalize">{sub.billing_cycle ?? '—'}</span>
                                    </Row>
                                    <Row label="Period Start">
                                        {sub.current_period_start
                                            ? new Date(sub.current_period_start).toLocaleDateString()
                                            : '—'}
                                    </Row>
                                    <Row label="Period End">
                                        {sub.current_period_end
                                            ? new Date(sub.current_period_end).toLocaleDateString()
                                            : '—'}
                                    </Row>
                                    {sub.trial_ends_at && (
                                        <Row label="Trial Ends">
                                            {new Date(sub.trial_ends_at).toLocaleDateString()}
                                        </Row>
                                    )}
                                    {sub.grace_period_ends_at && (
                                        <Row label="Grace Period Ends">
                                            {new Date(sub.grace_period_ends_at).toLocaleDateString()}
                                        </Row>
                                    )}
                                    {sub.canceled_at && (
                                        <Row label="Canceled At">
                                            <span className="text-destructive">
                                                {new Date(sub.canceled_at).toLocaleDateString()}
                                            </span>
                                        </Row>
                                    )}
                                    {parseFloat(sub.discount_amount) > 0 && (
                                        <Row label="Discount Applied">
                                            ₱{parseFloat(sub.discount_amount).toFixed(2)}
                                        </Row>
                                    )}
                                    {sub.promo_code && (
                                        <Row label="Promo Code">
                                            <span className="font-mono">{sub.promo_code.code}</span>
                                            {' '}
                                            <span className="text-muted-foreground text-xs">
                                                ({sub.promo_code.discount_type === 'percentage'
                                                    ? `${sub.promo_code.discount_value}% off`
                                                    : `₱${sub.promo_code.discount_value} off`})
                                            </span>
                                        </Row>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted-foreground">No active subscription on record.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Payment Method</CardTitle></CardHeader>
                        <CardContent>
                            {sub?.card_last_four ? (
                                <div className="flex items-center gap-4 rounded-lg border p-4">
                                    <div className="flex h-10 w-16 items-center justify-center rounded bg-muted text-xs font-bold uppercase">
                                        {sub.card_brand ?? 'CARD'}
                                    </div>
                                    <div>
                                        <p className="font-medium font-mono">•••• •••• •••• {sub.card_last_four}</p>
                                        <p className="text-xs capitalize text-muted-foreground">{sub.card_brand}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No payment method on file.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Subscription History */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Subscription History</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="table table-sm w-full">
                                <thead>
                                    <tr className="text-muted-foreground">
                                        <th>Plan</th>
                                        <th>Status</th>
                                        <th>Billing</th>
                                        <th>Period Start</th>
                                        <th>Period End</th>
                                        <th>Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-6 text-center text-muted-foreground">
                                                No history available.
                                            </td>
                                        </tr>
                                    ) : paymentHistory.map((h, i) => (
                                        <tr key={i} className="hover">
                                            <td>
                                                <span className={`badge badge-sm capitalize ${planBadge[h.plan] ?? 'badge-ghost'}`}>
                                                    {h.plan}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-sm capitalize ${statusBadge[h.status] ?? 'badge-ghost'}`}>
                                                    {h.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="capitalize text-sm">{h.billing_cycle ?? '—'}</td>
                                            <td className="text-xs text-muted-foreground">
                                                {h.current_period_start ? new Date(h.current_period_start).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="text-xs text-muted-foreground">
                                                {h.current_period_end ? new Date(h.current_period_end).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="text-xs text-muted-foreground">
                                                {new Date(h.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between border-b pb-2 last:border-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{children}</span>
        </div>
    );
}