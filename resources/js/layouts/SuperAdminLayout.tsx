import { NavUser } from '@/components/nav-user';
import { AppShell } from '@/components/app-shell';
import { AppContent } from '@/components/app-content';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { Link } from '@inertiajs/react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import {
    LayoutDashboard,
    School,
    Tag,
    BarChart3,
    CreditCard,
    Settings,
} from 'lucide-react';
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
import type { BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

const navItems = [
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
    { title: 'Promo Codes', href: '/super-admin/promo-codes', icon: Tag },
    { title: 'Analytics', href: '/super-admin/analytics', icon: BarChart3 },
];

interface Props extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

export default function SuperAdminLayout({
    children,
    breadcrumbs = [],
}: Props) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <AppShell variant="sidebar">
            <Sidebar collapsible="icon" variant="inset">
                {/* Logo */}
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/super-admin/dashboard">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                        <LayoutDashboard className="size-5" />
                                    </div>
                                    <div className="ml-1 grid flex-1 text-left text-sm">
                                        <span className="truncate leading-tight font-semibold">
                                            Borrowix
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            Super Admin
                                        </span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                {/* Nav */}
                <SidebarContent>
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Platform</SidebarGroupLabel>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(item.href)}
                                        tooltip={{ children: item.title }}
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

                    {/* Settings */}
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Settings</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem key="Profile">
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl('/settings/profile')}
                                    tooltip={{ children: 'Profile' }}
                                >
                                    <Link href="/settings/profile">
                                        <Settings className="size-4" />
                                        <span>Profile</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>

                {/* User */}
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
