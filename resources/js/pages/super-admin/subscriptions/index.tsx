import { Head, Link } from '@inertiajs/react';
import { CreditCard, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
    { title: 'Subscriptions', href: '/super-admin/subscriptions' },
];

interface Subscription {
    id: number;
    plan: string;
    status: string;
    billing_cycle: string;
    current_period_end: string | null;
    discount_amount: string;
    created_at: string;
    school: { id: string; name: string; email: string };
    promo_code: { code: string } | null;
}

interface Props {
    subscriptions: {
        data: Subscription[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    breakdown: Record<string, number>;
}

const planBadge: Record<string, string> = {
    free: 'badge-ghost',
    basic: 'badge-info',
    pro: 'badge-warning',
};

const planAccent: Record<string, string> = {
    free: 'border-l-slate-400',
    basic: 'border-l-blue-500',
    pro: 'border-l-amber-500',
};

const statusBadge: Record<string, string> = {
    active: 'badge-success',
    canceled: 'badge-neutral',
    past_due: 'badge-error',
    trialing: 'badge-accent',
};

export default function SubscriptionsIndex({
    subscriptions,
    breakdown,
}: Props) {
    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscriptions" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Subscriptions
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        All school subscription records across the platform.
                    </p>
                </div>

                {/* Plan breakdown */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {(['free', 'basic', 'pro'] as const).map((plan) => (
                        <Card
                            key={plan}
                            className={`border-l-4 ${planAccent[plan]}`}
                        >
                            <CardContent className="pt-4">
                                <div className="text-4xl font-bold tracking-tight">
                                    {breakdown[plan] ?? 0}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span
                                        className={`badge badge-sm capitalize ${planBadge[plan]}`}
                                    >
                                        {plan}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        schools
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            All Subscriptions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {subscriptions.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <CreditCard className="mb-3 size-10 text-muted-foreground/40" />
                                <p className="font-medium text-muted-foreground">
                                    No subscriptions yet
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Subscriptions will appear here once schools
                                    sign up.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    School
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Plan
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Billing
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Renews
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Discount
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Promo
                                                </th>
                                                <th className="px-4 py-3" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subscriptions.data.map((s) => (
                                                <tr
                                                    key={s.id}
                                                    className="border-b transition-colors last:border-0 hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">
                                                            {s.school.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {s.school.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`badge badge-sm capitalize ${planBadge[s.plan] ?? 'badge-ghost'}`}
                                                        >
                                                            {s.plan}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`badge badge-sm capitalize ${statusBadge[s.status] ?? 'badge-ghost'}`}
                                                        >
                                                            {s.status.replace(
                                                                /_/g,
                                                                ' ',
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm capitalize">
                                                        {s.billing_cycle ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                                        {s.current_period_end
                                                            ? new Date(
                                                                  s.current_period_end,
                                                              ).toLocaleDateString()
                                                            : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {parseFloat(
                                                            s.discount_amount,
                                                        ) > 0
                                                            ? `₱${parseFloat(s.discount_amount).toFixed(2)}`
                                                            : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {s.promo_code?.code ? (
                                                            <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold tracking-wide">
                                                                {
                                                                    s.promo_code
                                                                        .code
                                                                }
                                                            </code>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Link
                                                            href={`/super-admin/subscriptions/${s.school.id}`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                            >
                                                                <Eye className="size-4" />
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {subscriptions.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t pt-4">
                                        <p className="text-xs text-muted-foreground">
                                            Page {subscriptions.current_page} of{' '}
                                            {subscriptions.last_page}
                                        </p>
                                        <div className="flex gap-2">
                                            {subscriptions.prev_page_url && (
                                                <Link
                                                    href={
                                                        subscriptions.prev_page_url
                                                    }
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        ← Previous
                                                    </Button>
                                                </Link>
                                            )}
                                            {subscriptions.next_page_url && (
                                                <Link
                                                    href={
                                                        subscriptions.next_page_url
                                                    }
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Next →
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
