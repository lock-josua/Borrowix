import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    schoolName: string;
    plan: string;
    planLabel: string;
    amount: number;
}

export default function SubscriptionSuccess({
    schoolName,
    plan,
    planLabel,
    amount,
}: Props) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <Head title="Subscription Activated" />
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="w-full max-w-sm text-center">
                    <CardContent className="px-6 pt-8 pb-6">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100">
                            <BadgeCheck className="size-6 text-green-600" />
                        </div>
                        <h1 className="text-lg font-semibold">
                            Subscription Activated!
                        </h1>
                        <p className="mt-2 mb-1 text-sm text-muted-foreground">
                            {schoolName} is now subscribed to the
                        </p>
                        <p className="text-base font-bold text-foreground capitalize">
                            {planLabel} Plan — ₱{amount.toLocaleString()}
                        </p>
                        <p className="mt-1 mb-6 text-xs text-muted-foreground">
                            A confirmation email has been sent to your
                            registered address.
                        </p>
                        <Button
                            asChild
                            className="w-full bg-amber-600 text-white hover:bg-amber-700"
                        >
                            <Link href="/admin/dashboard">Go to Dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
