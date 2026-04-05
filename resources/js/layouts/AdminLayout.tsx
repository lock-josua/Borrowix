import { NavUser } from '@/components/nav-user';
import { AppShell } from '@/components/app-shell';
import { AppContent } from '@/components/app-content';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { Link } from '@inertiajs/react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import {
    LayoutDashboard,
    Package,
    ClipboardList,
    ArrowLeftRight,
    Users,
    BarChart3,
    CreditCard,
    Tag,
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

const operationsNav = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Equipment', href: '/admin/equipment', icon: Package },
    { title: 'Categories', href: '/admin/categories', icon: Tag },
    { title: 'Requests', href: '/admin/requests', icon: ClipboardList },
    {
        title: 'Transactions',
        href: '/admin/transactions',
        icon: ArrowLeftRight,
    },
    { title: 'Users', href: '/admin/users', icon: Users },
];

const insightsNav = [
    { title: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { title: 'Subscription', href: '/admin/subscription', icon: CreditCard },
    { title: 'Settings', href: '/admin/settings', icon: Settings },
];

interface Props extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

export default function AdminLayout({ children, breadcrumbs = [] }: Props) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <AppShell variant="sidebar">
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/admin/dashboard">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                        <LayoutDashboard className="size-5" />
                                    </div>
                                    <div className="ml-1 grid flex-1 text-left text-sm">
                                        <span className="truncate leading-tight font-semibold">
                                            Borrowix
                                        </span>
                                        <span className="badge badge-xs badge-outline truncate">
                                            Admin
                                        </span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Operations</SidebarGroupLabel>
                        <SidebarMenu>
                            {operationsNav.map((item) => (
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

                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Insights</SidebarGroupLabel>
                        <SidebarMenu>
                            {insightsNav.map((item) => (
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
