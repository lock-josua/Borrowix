import { Link, usePage } from '@inertiajs/react';
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
    ShieldCheck,
    RefreshCw,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { NavUser } from '@/components/nav-user';
import { TrialCountdown } from '@/components/trial-countdown';
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

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const operationsNav: NavItem[] = [
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

interface Props extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

function VersionBadge({ version }: { version: string }) {
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

export default function AdminLayout({ children, breadcrumbs = [] }: Props) {
    const { isCurrentUrl } = useCurrentUrl();
    const { can, version, tenantSubscription, tenant } = usePage().props as {
        can: Record<string, boolean>;
        version: string;
        tenantSubscription?: {
            status: string;
            plan: string | null;
            trial_ends_at: string | null;
            trial_days_remaining: number;
        } | null;
        tenant: {
            logo_url: string | null;
        } | null;
    };

    const insightsNav: NavItem[] = [
        { title: 'Reports', href: '/admin/reports', icon: BarChart3 },
        {
            title: 'Subscription',
            href: '/admin/subscription',
            icon: CreditCard,
        },
        { title: 'Settings', href: '/admin/settings', icon: Settings },
        { title: 'Updates', href: '/admin/settings/updates', icon: RefreshCw },
    ];

    const administrationNav: NavItem[] = [
        { title: 'Role Permissions', href: '/admin/rbac', icon: ShieldCheck },
    ];

    const filteredInsightsNav = insightsNav.filter((item) => {
        if (item.title === 'Reports') {
            return can.view_reports;
        }
        return true;
    });

    const filteredAdministrationNav = administrationNav.filter((item) => {
        if (item.title === 'Role Permissions') {
            return can.manage_rbac;
        }
        return true;
    });

    return (
        <AppShell variant="sidebar">
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/admin/dashboard">
                                    <div className="flex aspect-square size-10 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground">
                                        {tenant?.logo_url ? (
                                            <img
                                                src={tenant.logo_url}
                                                alt="Tenant logo"
                                                className="size-full rounded-full object-contain"
                                            />
                                        ) : (
                                            <LayoutDashboard className="size-4" />
                                        )}
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold text-foreground">
                                            Borrowix
                                        </span>
                                        <span className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Admin
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
                            {operationsNav.map((item) => (
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

                    {filteredInsightsNav.length > 0 && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Insights</SidebarGroupLabel>
                            <SidebarMenu>
                                {filteredInsightsNav.map((item) => (
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
                    )}

                    {filteredAdministrationNav.length > 0 && (
                        <SidebarGroup>
                            <SidebarGroupLabel>
                                Administration
                            </SidebarGroupLabel>
                            <SidebarMenu>
                                {filteredAdministrationNav.map((item) => (
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
                    )}
                </SidebarContent>

                <SidebarFooter>
                    <VersionBadge version={version} />
                    <NavUser />
                </SidebarFooter>
            </Sidebar>

            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {tenantSubscription?.status === 'trialing' &&
                    tenantSubscription.trial_ends_at && (
                        <div className="px-4 pt-3">
                            <TrialCountdown
                                trialEndsAt={tenantSubscription.trial_ends_at}
                                daysRemaining={
                                    tenantSubscription.trial_days_remaining
                                }
                            />
                        </div>
                    )}
                {children}
            </AppContent>
        </AppShell>
    );
}
