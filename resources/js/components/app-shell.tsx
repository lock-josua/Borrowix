import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';

type Props = {
    children: ReactNode;
    variant?: 'header' | 'sidebar';
};

export function AppShell({ children, variant = 'header' }: Props) {
    const isOpen = usePage().props.sidebarOpen;
    const { flash } = usePage().props as {
        flash?: {
            success?: string;
            error?: string;
            warning?: string;
            info?: string;
        };
    };

    const lastFlash = useRef<typeof flash | null>(null);

    useEffect(() => {
        if (!flash) {
            lastFlash.current = null;
            return;
        }

        // Only toast if this is a new flash object
        if (flash === lastFlash.current) return;

        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
        if (flash.warning) {
            toast.warning(flash.warning);
        }
        if (flash.info) {
            toast.info(flash.info);
        }

        lastFlash.current = flash;
    }, [flash]);

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">
                {children}
                <Toaster />
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={isOpen}>
            {children}
            <Toaster />
        </SidebarProvider>
    );
}
