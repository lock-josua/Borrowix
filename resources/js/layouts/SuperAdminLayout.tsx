import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    School,
    BarChart3,
    CreditCard,
    Settings,
    RefreshCw,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { BreadcrumbItem } from '@/types';

const platformNav = [
    {
        title: 'Dashboard',
        href: '/super-admin/dashboard',
        icon: LayoutDashboard,
    },
    { title: 'Schools', href: '/super-admin/schools', icon: School },
    {
        title: 'Subscriptions',
        href: '/super-admin/subscriptions',
        icon: CreditCard,
    },

    { title: 'Analytics', href: '/super-admin/analytics', icon: BarChart3 },
];

interface Props extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

function VersionBadge({ version }: { version: string }) {
    // updateStatus is only present on the updates page; on all other pages has_update will be undefined
    const props = usePage().props as { updateStatus?: { has_update: boolean } };
    const hasUpdate = props.updateStatus?.has_update ?? false;

    return (
        <div className="flex items-center gap-1.5 px-3 py-2">
            <span className="text-xs text-muted-foreground">v{version}</span>
            {hasUpdate && (
                <span
                    className="inline-flex size-2 animate-pulse rounded-full bg-amber-400"
                    title="A new version is available"
                />
            )}
        </div>
    );
}

export default function SuperAdminLayout({
    children,
    breadcrumbs = [],
}: Props) {
    const { isCurrentUrl } = useCurrentUrl();
    const { version } = usePage().props;

    return (
        <AppShell variant="sidebar">
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/super-admin/dashboard">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                        <LayoutDashboard className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold text-foreground">
                                            Borrowix
                                        </span>
                                        <span className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Super Admin
                                        </span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Platform</SidebarGroupLabel>
                        <SidebarMenu>
                            {platformNav.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                        className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="size-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>

                    <SidebarGroup>
                        <SidebarGroupLabel>System</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(
                                        '/super-admin/settings',
                                    )}
                                    tooltip={{ children: 'Settings' }}
                                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
                                >
                                    <Link href="/super-admin/settings">
                                        <Settings className="size-4" />
                                        <span>Settings</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(
                                        '/super-admin/settings/updates',
                                    )}
                                    tooltip={{ children: 'Updates' }}
                                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
                                >
                                    <Link href="/super-admin/settings/updates">
                                        <RefreshCw className="size-4" />
                                        <span>Updates</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter>
                    <VersionBadge version={version} />
                    <NavUser />
                </SidebarFooter>
            </Sidebar>

            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
