import { usePage } from '@inertiajs/react';
import { AppearanceToggle } from '@/components/appearance-toggle';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationBell } from '@/components/notification-bell';
import { SuperAdminAppearanceToggle } from '@/components/super-admin-appearance-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType, PageProps } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { tenant } = usePage<PageProps>().props;
    const isSuperAdmin = !tenant;

    return (
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-6 backdrop-blur-sm transition-shadow duration-150 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-2">
                <NotificationBell />
                {isSuperAdmin ? <SuperAdminAppearanceToggle /> : <AppearanceToggle />}
            </div>
        </header>
    );
}
