import { Head, Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
                    <h1 className="text-2xl font-bold">Subscriptions</h1>
                    <p className="text-sm text-muted-foreground">
                        All school subscription records across the platform.
                    </p>
                </div>

                {/* Plan breakdown */}
                <div className="grid grid-cols-3 gap-4">
                    {(['free', 'basic', 'pro'] as const).map((plan) => (
                        <Card key={plan}>
                            <CardContent className="pt-4">
                                <div className="text-3xl font-bold">
                                    {breakdown[plan] ?? 0}
                                </div>
                                <div className="mt-1 flex items-center gap-2">
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

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            All Subscriptions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="table-sm table w-full">
                                <thead>
                                    <tr className="text-muted-foreground">
                                        <th>School</th>
                                        <th>Plan</th>
                                        <th>Status</th>
                                        <th>Billing</th>
                                        <th>Renews</th>
                                        <th>Discount</th>
                                        <th>Promo</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscriptions.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No subscriptions yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        subscriptions.data.map((s) => (
                                            <tr key={s.id} className="hover">
                                                <td>
                                                    <div className="font-medium">
                                                        {s.school.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {s.school.email}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge badge-sm capitalize ${planBadge[s.plan] ?? 'badge-ghost'}`}
                                                    >
                                                        {s.plan}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge badge-sm capitalize ${statusBadge[s.status] ?? 'badge-ghost'}`}
                                                    >
                                                        {s.status.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="text-sm capitalize">
                                                    {s.billing_cycle ?? '—'}
                                                </td>
                                                <td className="text-xs text-muted-foreground">
                                                    {s.current_period_end
                                                        ? new Date(
                                                              s.current_period_end,
                                                          ).toLocaleDateString()
                                                        : '—'}
                                                </td>
                                                <td className="text-sm">
                                                    {parseFloat(
                                                        s.discount_amount,
                                                    ) > 0
                                                        ? `₱${parseFloat(s.discount_amount).toFixed(2)}`
                                                        : '—'}
                                                </td>
                                                <td className="font-mono text-xs">
                                                    {s.promo_code?.code ?? '—'}
                                                </td>
                                                <td>
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
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {subscriptions.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-2">
                                {subscriptions.prev_page_url && (
                                    <Link href={subscriptions.prev_page_url}>
                                        <Button variant="outline" size="sm">
                                            Previous
                                        </Button>
                                    </Link>
                                )}
                                <span className="flex items-center text-sm text-muted-foreground">
                                    Page {subscriptions.current_page} of{' '}
                                    {subscriptions.last_page}
                                </span>
                                {subscriptions.next_page_url && (
                                    <Link href={subscriptions.next_page_url}>
                                        <Button variant="outline" size="sm">
                                            Next
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
