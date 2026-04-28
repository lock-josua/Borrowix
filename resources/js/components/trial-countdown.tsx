import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TrialCountdownProps {
    trialEndsAt: string;
    daysRemaining: number;
    showSubscribeButton?: boolean;
}

export function TrialCountdown({
    trialEndsAt,
    daysRemaining,
    showSubscribeButton = true,
}: TrialCountdownProps) {
    const [timeLeft, setTimeLeft] = useState(getTimeLeft(trialEndsAt));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getTimeLeft(trialEndsAt));
        }, 1_000);

        return () => clearInterval(interval);
    }, [trialEndsAt]);

    const isUrgent = daysRemaining <= 3;
    const isWarning = daysRemaining <= 10;

    const colorClass = isUrgent
        ? 'border-destructive/30 bg-destructive/10 text-destructive'
        : isWarning
          ? 'border-accent/30 bg-accent/10 text-accent'
          : 'border-primary/30 bg-primary/5 text-primary';

    return (
        <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm ${colorClass}`}
        >
            <Clock className="size-4 shrink-0" />

            <div className="flex flex-1 flex-wrap items-center gap-2">
                <span className="font-medium">Trial ends in</span>
                <Badge
                    variant="outline"
                    className={`font-mono text-xs ${
                        isUrgent
                            ? 'border-destructive text-destructive'
                            : isWarning
                              ? 'border-accent text-accent'
                              : 'border-primary/50 text-primary'
                    }`}
                >
                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{' '}
                    {timeLeft.seconds}s
                </Badge>
            </div>

            {showSubscribeButton && (
                <Button
                    asChild
                    size="sm"
                    className="h-7 bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
                >
                    <Link href="/admin/subscription">Subscribe</Link>
                </Button>
            )}
        </motion.div>
    );
}

function getTimeLeft(trialEndsAt: string) {
    const end = new Date(trialEndsAt).getTime();
    const now = Date.now();
    const diff = Math.max(0, end - now);

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
}
