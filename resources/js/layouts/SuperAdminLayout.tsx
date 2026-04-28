import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    School,
    BarChart3,
    CreditCard,
    Settings,
    MessageSquare,
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
import type { BreadcrumbItem, PageProps } from '@/types';

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
    {
        title: 'Feedback & Support',
        href: '/super-admin/feedbacks',
        icon: MessageSquare,
    },
];

interface Props extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

export default function SuperAdminLayout({
    children,
    breadcrumbs = [],
}: Props) {
    const { isCurrentUrl } = useCurrentUrl();
    usePage<PageProps>(); // Ensure version is available via props if needed, but not used here

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
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter>
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
