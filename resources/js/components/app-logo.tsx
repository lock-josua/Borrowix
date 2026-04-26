import { usePage } from '@inertiajs/react';
import { LayoutDashboard } from 'lucide-react';

interface TenantProps {
    logo_url: string | null;
    school_name: string;
}

export default function AppLogo() {
    const { tenant } = usePage().props as { tenant: TenantProps | null };

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                {tenant?.logo_url ? (
                    <img
                        src={tenant.logo_url}
                        alt={tenant.school_name}
                        className="size-full object-cover"
                    />
                ) : (
                    <LayoutDashboard className="size-5 text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {tenant?.school_name ?? 'Borrowix'}
                </span>
            </div>
        </>
    );
}
