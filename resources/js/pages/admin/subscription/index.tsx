import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Subscription', href: '/admin/subscription' },
];

interface Subscription {
    plan: string;
    status: string;
    billing_cycle: string;
    current_period_end: string | null;
    card_brand: string | null;
    card_last_four: string | null;
}

interface Props {
    school: { name: string; plan: string };
    subscription: Subscription | null;
}

const plans = [
    {
        id: 'basic',
        name: 'Basic',
        price: '₱499/mo',
        features: ['Up to 100 equipment', 'Up to 50 users', 'Email notifications', 'Basic reports'],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '₱999/mo',
        features: [
            'Unlimited equipment',
            'Unlimited users',
            'SMS + Email notifications',
            'Advanced reports',
            'QR code scanning',
            'Priority support',
        ],
    },
];

export default function SubscriptionIndex({ school, subscription }: Props) {
    const [cancelOpen, setCancelOpen] = useState(false);

    function handleUpgrade(plan: string) {
        router.post('/admin/subscription/upgrade', { plan });
    }

    function handleCancel() {
        router.post('/admin/subscription/cancel', {}, { onSuccess: () => setCancelOpen(false) });
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscription" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Subscription"
                    description="Manage your school's plan and billing."
                />

                {/* Current Plan */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Current Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold capitalize">
                                {school.plan}
                            </span>
                            <StatusBadge status={school.plan} />
                        </div>
                        {subscription && (
                            <>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <span>Status:</span>
                                    <StatusBadge status={subscription.status} />
                                </div>
                                {subscription.current_period_end && (
                                    <p className="text-muted-foreground">
                                        Renews:{' '}
                                        <span className="font-medium text-foreground">
                                            {new Date(subscription.current_period_end).toLocaleDateString()}
                                        </span>
                                    </p>
                                )}
                                {subscription.card_last_four && (
                                    <p className="text-muted-foreground">
                                        Payment:{' '}
                                        <span className="font-medium capitalize text-foreground">
                                            {subscription.card_brand} •••• {subscription.card_last_four}
                                        </span>
                                    </p>
                                )}
                                {school.plan !== 'free' && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => setCancelOpen(true)}
                                    >
                                        Cancel Subscription
                                    </Button>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Plan Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`transition-colors duration-150 ${school.plan === plan.id ? 'border-primary/70 shadow-sm' : 'border-border/60'}`}
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                                    <span className="text-xl font-bold text-foreground">
                                        {plan.price}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-2">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="size-4 shrink-0 text-primary" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                {school.plan === plan.id ? (
                                    <Button className="w-full" disabled>
                                        Current Plan
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full"
                                        onClick={() => handleUpgrade(plan.id)}
                                    >
                                        Upgrade to {plan.name}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </motion.div>

            <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Subscription?</DialogTitle>
                        <DialogDescription>
                            Your school will be downgraded to the Free plan. Some features will
                            be unavailable immediately after cancellation.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelOpen(false)}>
                            Keep Subscription
                        </Button>
                        <Button variant="destructive" onClick={handleCancel}>
                            Cancel Subscription
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}