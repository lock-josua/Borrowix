import { Link } from '@inertiajs/react';
import {
    LayoutDashboard,
    Package,
    ArrowLeftRight,
    ClipboardList,
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

const navItems = [
    { title: 'Dashboard', href: '/staff/dashboard', icon: LayoutDashboard },
    { title: 'Requests', href: '/staff/requests', icon: ClipboardList },
    { title: 'Equipment', href: '/staff/equipment', icon: Package },
    {
        title: 'Transactions',
        href: '/staff/transactions',
        icon: ArrowLeftRight,
    },
];

interface Props extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

export default function StaffLayout({ children, breadcrumbs = [] }: Props) {
    const { isCurrentUrl } = useCurrentUrl();
    return (
        <AppShell variant="sidebar">
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/staff/dashboard">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                        <LayoutDashboard className="size-5" />
                                    </div>
                                    <div className="ml-1 grid flex-1 text-left text-sm">
                                        <span className="truncate leading-tight font-semibold">
                                            Borrowix
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            Staff
                                        </span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Menu</SidebarGroupLabel>
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
