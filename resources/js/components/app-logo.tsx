import { usePage } from '@inertiajs/react';
import { LayoutDashboard } from 'lucide-react';

interface TenantProps {
    logo_url: string | null;
    school_name: string;
}

export default function AppLogo() {
    const { tenant } = usePage().props as { tenant: TenantProps | null };

    return (
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:gap-0">
            <div className="flex h-8 w-8 flex-none shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                {tenant?.logo_url ? (
                    <img
                        src={tenant.logo_url}
                        alt={tenant.school_name}
                        className="h-full w-full rounded-full object-cover"
                    />
                ) : (
                    <LayoutDashboard className="size-5 text-white dark:text-black" />
                )}
            </div>
            <div className="grid flex-1 text-left text-sm group-data-[collapsible=icon]:hidden">
                <span className="mb-0.5 truncate leading-tight font-semibold text-foreground">
                    {tenant?.school_name ?? 'Borrowix'}
                </span>
            </div>
        </div>
    );
}
