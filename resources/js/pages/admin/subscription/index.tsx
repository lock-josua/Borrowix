import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BadgeCheck, CreditCard, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { TrialCountdown } from '@/components/trial-countdown';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Subscription', href: '/admin/subscription' },
];

interface Plan {
    label: string;
    price: number;
    currency: string;
    paypal_plan_id: string;
}

interface SubscriptionData {
    id: number;
    status: string;
    plan: string | null;
    trial_ends_at: string | null;
    trial_days_remaining: number;
    current_period_end: string | null;
    paypal_subscription_id: string | null;
}

interface Payment {
    plan: string;
    amount: string;
    currency: string;
    status: string;
    paid_at: string;
}

interface Props {
    school: { name: string; status: string; plan: string | null };
    subscription: SubscriptionData | null;
    plans: Record<string, Plan>;
    payments: Payment[];
}

export default function SubscriptionIndex({
    school,
    subscription,
    plans,
    payments,
}: Props) {
    const { errors } = usePage().props as { errors?: Record<string, string> };
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    // One hidden form per plan — submitted natively so the browser follows
    // the server-side redirect()->away() to PayPal as a full page navigation.
    // Using router.post() (Axios/XHR) would cause a CORS error because the
    // browser blocks cross-origin XHR redirects to paypal.com.
    const formRefs = useRef<Record<string, HTMLFormElement | null>>({});

    const isTrialing = subscription?.status === 'trialing';
    const isSubscribed = subscription?.status === 'subscribed';

    function handleCheckout(planKey: string) {
        setLoadingPlan(planKey);
        formRefs.current[planKey]?.submit();
    }

    // Get the CSRF token from the meta tag Inertia injects
    const csrfToken =
        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
            ?.content ?? '';

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscription" />

            {/* Hidden native forms — one per plan */}
            {Object.keys(plans).map((key) => (
                <form
                    key={key}
                    ref={(el) => {
                        formRefs.current[key] = el;
                    }}
                    method="POST"
                    action="/admin/subscription/checkout"
                    style={{ display: 'none' }}
                >
                    <input type="hidden" name="_token" value={csrfToken} />
                    <input type="hidden" name="plan" value={key} />
                </form>
            ))}

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Subscription"
                    description="Manage your school's Borrowix subscription."
                    actions={<StatusBadge status={school.status} />}
                />

                {errors?.paypal && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                        {errors.paypal}
                    </div>
                )}

                {isTrialing && subscription?.trial_ends_at && (
                    <TrialCountdown
                        trialEndsAt={subscription.trial_ends_at}
                        daysRemaining={subscription.trial_days_remaining}
                        showSubscribeButton={false}
                    />
                )}

                {isSubscribed && subscription && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BadgeCheck className="size-5 text-green-600" />
                                Active Subscription
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm text-muted-foreground">
                            <p>
                                Plan:{' '}
                                <span className="font-medium text-foreground capitalize">
                                    {subscription.plan}
                                </span>
                            </p>
                            {subscription.current_period_end && (
                                <p>
                                    Next billing:{' '}
                                    <span className="font-medium text-foreground">
                                        {new Date(
                                            subscription.current_period_end,
                                        ).toLocaleDateString('en-PH', {
                                            dateStyle: 'long',
                                        })}
                                    </span>
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {!isSubscribed && (
                    <>
                        <h2 className="text-sm font-semibold text-foreground">
                            {isTrialing
                                ? 'Subscribe to continue after your trial'
                                : 'Choose a plan to restore access'}
                        </h2>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {Object.entries(plans).map(([key, plan]) => (
                                <Card
                                    key={key}
                                    className={`transition-shadow ${key === 'annually' ? 'border-amber-400/60 shadow-sm' : ''}`}
                                >
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            {plan.label}
                                        </CardTitle>
                                        <CardDescription>
                                            <span className="text-2xl font-bold text-foreground">
                                                ₱{plan.price.toLocaleString()}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {key === 'monthly'
                                                    ? '/month'
                                                    : '/year'}
                                            </span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground">
                                        {key === 'annually' && (
                                            <p className="font-medium text-amber-600">
                                                Save ~17% vs monthly
                                            </p>
                                        )}
                                        <ul className="mt-2 list-inside list-disc space-y-1">
                                            <li>
                                                Unlimited equipment management
                                            </li>
                                            <li>Unlimited borrow requests</li>
                                            <li>Full reporting & analytics</li>
                                            <li>Priority support</li>
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className="w-full bg-amber-600 text-white hover:bg-amber-700"
                                            onClick={() => handleCheckout(key)}
                                            disabled={loadingPlan !== null}
                                        >
                                            {loadingPlan === key ? (
                                                <>
                                                    <Loader2 className="mr-2 size-4 animate-spin" />{' '}
                                                    Redirecting to PayPal…
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="mr-2 size-4" />{' '}
                                                    Subscribe — {plan.label}
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </>
                )}

                {payments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">
                                Payment History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border">
                                {payments.map((p, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between py-2 text-sm"
                                    >
                                        <div>
                                            <span className="font-medium capitalize">
                                                {p.plan} Plan
                                            </span>
                                            <span className="ml-2 text-muted-foreground">
                                                {new Date(
                                                    p.paid_at,
                                                ).toLocaleDateString('en-PH')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                ₱
                                                {Number(
                                                    p.amount,
                                                ).toLocaleString()}
                                            </span>
                                            <StatusBadge status={p.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </motion.div>
        </AdminLayout>
    );
}
