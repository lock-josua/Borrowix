import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Search,
    ClipboardList,
    History,
    Zap,
    ScanLine,
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
        { title: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
        { title: 'Browse Equipment', href: '/student/browse', icon: Search },
        ...(can?.can_scan
            ? [{ title: 'Scan Equipment', href: '/student/scan', icon: ScanLine }]
            : []),
        {
            title: 'My Requests',
            href: '/student/borrow-requests',
            icon: ClipboardList,
        },
        { title: 'My History', href: '/student/history', icon: History },
    ];

    if (isMobileOrTablet) {
        return (
            <AppShell variant="header">
                <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
                    <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center overflow-hidden rounded-lg bg-primary text-primary-foreground">
                            {tenant?.logo_url ? (
                                <img
                                    src={tenant.logo_url}
                                    alt="Tenant logo"
                                    className="size-full rounded-lg object-contain"
                                />
                            ) : (
                                <Zap className="size-3.5" />
                            )}
                        </div>
                        <span className="text-[13px] font-semibold text-foreground">
                            Borrowix
                        </span>
                    </div>
                    <MobileUserButton />
                </header>

                <main className="flex-1 overflow-y-auto pb-[calc(64px+env(safe-area-inset-bottom,0px))]">
                    {children}
                </main>

                <nav
                    className="fixed right-0 bottom-0 left-0 z-50 border-t bg-background/95 backdrop-blur"
                    style={{
                        paddingBottom:
                            'max(8px, env(safe-area-inset-bottom, 8px))',
                    }}
                >
                    <div className="flex items-stretch">
                        {navItems.map((item) => {
                            const active = isCurrentUrl(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex flex-1 flex-col items-center justify-center gap-1 pt-2 transition-colors ${
                                        active
                                            ? 'text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <div
                                        className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                                            active ? 'bg-primary/10' : ''
                                        }`}
                                    >
                                        <item.icon className="size-[18px]" />
                                    </div>
                                    <span className="text-[10px] leading-none font-medium">
                                        {item.title}
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
                                    <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground">
                                        {tenant?.logo_url ? (
                                            <img
                                                src={tenant.logo_url}
                                                alt="Tenant logo"
                                                className="size-full rounded-md object-contain"
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
    const user = auth.user as { name: string };

    const initials = user.name
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <button
            onClick={() => router.visit('/settings/profile')}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground hover:bg-muted/80"
            title={user.name}
        >
            {initials}
        </button>
    );
}
