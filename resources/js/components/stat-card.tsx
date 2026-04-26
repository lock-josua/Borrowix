import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
    title: string;
    value: number | string;
    sub?: string;
    trend?: 'up' | 'down' | 'neutral';
    valueColor?: string;
    icon?: ReactNode;
    delay?: number;
}

export function StatCard({
    title,
    value,
    sub,
    trend,
    valueColor,
    icon,
    delay = 0,
}: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut', delay }}
        >
            <Card className="transition-all duration-150 hover:shadow-sm">
                <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            {title}
                        </p>
                        {icon && (
                            <div className="text-muted-foreground/50 [&_svg]:size-4">
                                {icon}
                            </div>
                        )}
                    </div>
                    <p
                        className="text-2xl leading-none font-semibold"
                        style={valueColor ? { color: valueColor } : undefined}
                    >
                        {value}
                    </p>
                    {sub && (
                        <p
                            className={`mt-1.5 flex items-center gap-1 text-xs ${
                                trend === 'up'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : trend === 'down'
                                      ? 'text-red-500 dark:text-red-400'
                                      : 'text-muted-foreground'
                            }`}
                        >
                            {trend === 'up' && '↑'}
                            {trend === 'down' && '↓'}
                            {sub}
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
