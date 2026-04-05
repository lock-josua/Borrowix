import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Search,
    ClipboardList,
    History,
    Zap,
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

// ── Navigation items (shared between sidebar and bottom nav) ──
const navItems = [
    { title: 'Home', href: '/student/dashboard', icon: LayoutDashboard },
    { title: 'Browse', href: '/student/browse', icon: Search },
    {
        title: 'Requests',
        href: '/student/borrow-requests',
        icon: ClipboardList,
    },
    { title: 'History', href: '/student/history', icon: History },
];

interface Props extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

export default function StudentLayout({ children, breadcrumbs = [] }: Props) {
    const { isCurrentUrl } = useCurrentUrl();
    const isMobileOrTablet = useIsTabletOrBelow();

    // ── Mobile / Tablet: bottom nav layout ────────────────────
    if (isMobileOrTablet) {
        return (
            <AppShell variant="header">
                {/* Top bar */}
                <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
                    <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Zap className="size-3.5" />
                        </div>
                        <span className="text-[13px] font-semibold">
                            Borrowix
                        </span>
                    </div>
                    {/* User avatar dropdown — reuses existing NavUser logic */}
                    <MobileUserButton />
                </header>

                {/* Page content — padded bottom so content clears the bottom nav */}
                <main className="flex-1 overflow-y-auto pb-[calc(64px+env(safe-area-inset-bottom,0px))]">
                    {children}
                </main>

                {/* Bottom navigation bar */}
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

    // ── Desktop: sidebar layout (lg and above) ─────────────────
    return (
        <AppShell variant="sidebar">
            <Sidebar collapsible="icon" variant="inset" className="border-r-0">
                <SidebarHeader className="px-3 py-3">
                    <Link
                        href="/student/dashboard"
                        className="flex items-center gap-2.5"
                    >
                        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Zap className="size-3.5" />
                        </div>
                        <div className="grid leading-none">
                            <span className="text-[13px] font-semibold">
                                Borrowix
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                                Student
                            </span>
                        </div>
                    </Link>
                </SidebarHeader>

                <SidebarContent className="px-2 pt-2">
                    <SidebarGroup className="p-0">
                        <SidebarGroupLabel className="px-2 text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                            Student Portal
                        </SidebarGroupLabel>
                        <SidebarMenu className="gap-0.5">
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                        className="h-8 rounded-md px-2 text-[13px]"
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="size-[15px]" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="p-2">
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

// ── Mobile user button ─────────────────────────────────────────
// Shows the user's initials as a circular avatar button.
// Tapping it opens the settings page (profile/logout).
// This keeps the top bar clean without needing the full NavUser sidebar component.
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
