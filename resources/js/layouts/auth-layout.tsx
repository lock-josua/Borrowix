import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import type { ReactNode } from 'react';

export default function AuthLayout({
    children,
    title,
    description,
}: {
    children: ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex min-h-screen">
            {/* Left panel (hidden on mobile, lg:flex) */}
            <div className="hidden w-[420px] flex-shrink-0 flex-col justify-between bg-primary p-10 lg:flex">
                <div className="flex items-center gap-2 text-white">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                        <Zap className="size-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        Borrowix
                    </span>
                </div>

                <div className="max-w-xs">
                    <p className="text-sm leading-relaxed text-white/80">
                        Manage ICT equipment borrowing across your school —
                        simple, trackable, fair.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="h-12 w-48 rounded-xl bg-white/10" />
                    <div className="h-12 w-40 rounded-xl bg-white/10 opacity-60" />
                    <div className="h-12 w-32 rounded-xl bg-white/10 opacity-30" />
                </div>
            </div>

            {/* Right panel */}
            <div className="flex flex-1 items-center justify-center bg-background p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="w-full max-w-sm"
                >
                    <div className="mb-6">
                        <h1 className="text-xl font-semibold text-foreground">
                            {title}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </motion.div>
            </div>
        </div>
    );
}
