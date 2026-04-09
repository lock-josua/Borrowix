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
        <div className="min-h-screen flex">
            {/* Left panel (hidden on mobile, lg:flex) */}
            <div className="hidden lg:flex w-[420px] flex-shrink-0 bg-primary flex-col justify-between p-10">
                <div className="flex items-center gap-2 text-white">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                        <Zap className="size-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Borrowix</span>
                </div>

                <div className="max-w-xs">
                    <p className="text-white/80 text-sm leading-relaxed">
                        Manage ICT equipment borrowing across your school — simple, trackable, fair.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="w-48 h-12 bg-white/10 rounded-xl" />
                    <div className="w-40 h-12 bg-white/10 rounded-xl opacity-60" />
                    <div className="w-32 h-12 bg-white/10 rounded-xl opacity-30" />
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="w-full max-w-sm"
                >
                    <div className="mb-6">
                        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                        <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    </div>
                    {children}
                </motion.div>
            </div>
        </div>
    );
}
