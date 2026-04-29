import { Link, usePage, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Search,
    ClipboardList,
    History,
    Zap,
    ScanLine,
    Settings,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { NavUser } from '@/components/nav-user';
import { NotificationBell } from '@/components/notification-bell';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useIsTabletOrBelow } from '@/hooks/use-mobile';
import type { BreadcrumbItem } from '@/types';

interface Props extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

export default function StudentLayout({ children, breadcrumbs = [] }: Props) {
    const { isCurrentUrl } = useCurrentUrl();
    const isMobileOrTablet = useIsTabletOrBelow();
    const { version, can, tenant } = usePage().props as {
        version: string;
        can?: {
            can_scan?: boolean;
        };
        tenant: {
            logo_url: string | null;
        } | null;
    };

    const navItems = [
        {
            title: 'Dashboard',
            href: '/student/dashboard',
            icon: LayoutDashboard,
        },
        { title: 'Browse Equipment', href: '/student/browse', icon: Search },
        ...(can?.can_scan
            ? [
                {
                    title: 'Scan Equipment',
                    href: '/student/scan',
                    icon: ScanLine,
                },
            ]
            : []),
        {
            title: 'My Requests',
            href: '/student/borrow-requests',
            icon: ClipboardList,
        },
        { title: 'My History', href: '/student/history', icon: History },
        {
            title: 'Settings',
            href: '/student/settings/profile',
            icon: Settings,
        },
    ];

    if (isMobileOrTablet) {
        return (
            <AppShell variant="header">
                <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur transition-all duration-200">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center overflow-hidden rounded-xl bg-primary/10 shadow-sm ring-1 ring-primary/20">
                            {tenant?.logo_url ? (
                                <img
                                    src={tenant.logo_url}
                                    alt="Tenant logo"
                                    className="size-full object-contain p-1.5"
                                />
                            ) : (
                                <Zap className="size-5 text-primary" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[14px] leading-tight font-bold tracking-tight text-foreground">
                                Borrowix
                            </span>
                            <span className="text-[10px] leading-tight font-medium text-muted-foreground uppercase">
                                Student Portal
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <NotificationBell />
                        <MobileUserButton />
                    </div>
                </header>

                <main className="flex-1 px-4 py-6 pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
                    {children}
                </main>

                <nav
                    className="fixed right-0 bottom-0 left-0 z-50 border-t border-border/50 bg-background/80 shadow-[0_-1px_10px_rgba(0,0,0,0.05)] backdrop-blur-xl"
                    style={{
                        paddingBottom:
                            'max(8px, env(safe-area-inset-bottom, 8px))',
                    }}
                >
                    <div className="flex h-16 items-stretch px-2">
                        {navItems.map((item) => {
                            const active = isCurrentUrl(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative flex flex-1 flex-col items-center justify-center gap-1 transition-all duration-300 ${active
                                            ? 'text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
                                        />
                                    )}
                                    <div
                                        className={`flex size-10 items-center justify-center rounded-xl transition-all duration-300 ${active
                                                ? 'scale-110 bg-primary/10'
                                                : 'scale-100'
                                            }`}
                                    >
                                        <item.icon
                                            className={`size-[20px] transition-transform ${active ? 'stroke-[2.5px]' : 'stroke-[2px]'}`}
                                        />
                                    </div>
                                    <span
                                        className={`text-[10px] leading-none font-bold tracking-tight transition-all ${active ? 'opacity-100' : 'opacity-70'}`}
                                    >
                                        {item.title.split(' ')[0]}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </AppShell>
        );
    }

    return (
        <AppShell variant="sidebar">
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/student/dashboard">
                                    <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground">
                                        {tenant?.logo_url ? (
                                            <img
                                                src={tenant.logo_url}
                                                alt="Tenant logo"
                                                className="size-full rounded-full object-contain"
                                            />
                                        ) : (
                                            <Zap className="size-4" />
                                        )}
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold text-foreground">
                                            Borrowix
                                        </span>
                                        <span className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Student
                                        </span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Operations</SidebarGroupLabel>
                        <SidebarMenu>
                            {navItems.map((item) => (
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
                </SidebarContent>

                <SidebarFooter>
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                        v{version}
                    </div>
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

function MobileUserButton() {
    const { auth } = usePage().props;
    const user = auth.user as { name: string; email: string };

    const initials = user.name
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="flex size-9 items-center justify-center rounded-xl bg-muted/50 text-[12px] font-bold text-foreground ring-1 ring-border transition-all hover:bg-muted active:scale-95"
                    title={user.name}
                >
                    {initials}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                side="bottom"
                className="mt-2 w-56"
            >
                <DropdownMenuLabel className="flex flex-col">
                    <span className="truncate text-sm font-bold">
                        {user.name}
                    </span>
                    <span className="truncate text-[10px] font-medium text-muted-foreground">
                        {user.email}
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/settings/profile" className="cursor-pointer">
                        View Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings/password" className="cursor-pointer">
                        Security
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => router.post('/logout')}
                >
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
