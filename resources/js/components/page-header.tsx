import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    backHref?: string;
}

export function PageHeader({
    title,
    description,
    actions,
    backHref,
}: PageHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex items-start justify-between"
        >
            <div className="flex items-center gap-3">
                {backHref && (
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={backHref}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                )}
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {actions && (
                <div className="ml-4 flex shrink-0 items-center gap-2">
                    {actions}
                </div>
            )}
        </motion.div>
    );
}
