import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Clock, CreditCard, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface Plan {
    label: string;
    price: number;
}

interface Props {
    schoolName: string;
    plans: Record<string, Plan>;
}

export default function TrialExpiredAdmin({ schoolName, plans }: Props) {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    // Native form refs — same fix as subscription/index.tsx.
    // router.post() is XHR and cannot follow a cross-origin redirect to PayPal.
    // A native form.submit() causes a full page navigation which PayPal allows.
    const formRefs = useRef<Record<string, HTMLFormElement | null>>({});
    const csrfToken =
        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
            ?.content ?? '';

    function handleCheckout(planKey: string) {
        setLoadingPlan(planKey);
        formRefs.current[planKey]?.submit();
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <Head title="Trial Expired — Subscribe to Continue" />

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
                transition={{ duration: 0.3 }}
                className="w-full max-w-lg space-y-6"
            >
                <div className="text-center">
                    <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-amber-100">
                        <Clock className="size-6 text-amber-600" />
                    </div>
                    <h1 className="text-xl font-semibold text-foreground">
                        Your trial has ended
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        The 14-day free trial for <strong>{schoolName}</strong>{' '}
                        has expired. Subscribe to restore full access for your
                        school.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {Object.entries(plans).map(([key, plan]) => (
                        <Card
                            key={key}
                            className={
                                key === 'annually'
                                    ? 'border-amber-400/60 shadow-sm'
                                    : ''
                            }
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    {plan.label}
                                </CardTitle>
                                <CardDescription>
                                    <span className="text-xl font-bold text-foreground">
                                        ₱{plan.price.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {key === 'monthly' ? '/month' : '/year'}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2 text-xs text-muted-foreground">
                                {key === 'annually' && (
                                    <p className="mb-1 font-medium text-amber-600">
                                        Save ~17%
                                    </p>
                                )}
                                Full access · All features · Priority support
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full bg-amber-600 text-white hover:bg-amber-700"
                                    size="sm"
                                    onClick={() => handleCheckout(key)}
                                    disabled={loadingPlan !== null}
                                >
                                    {loadingPlan === key ? (
                                        <>
                                            <Loader2 className="mr-1.5 size-3.5 animate-spin" />{' '}
                                            Redirecting…
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="mr-1.5 size-3.5" />{' '}
                                            {plan.label}
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    Need help? Contact{' '}
                    <a href="mailto:support@borrowix.com" className="underline">
                        support@borrowix.com
                    </a>
                </p>
            </motion.div>
        </div>
    );
}
