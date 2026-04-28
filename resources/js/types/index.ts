import type { Auth, Can } from './auth';

export type BreadcrumbItem = {
    title: string;
    href: string;
};

export type Tenant = {
    logo_url: string | null;
    primary_color: string;
    active_theme: string;
    school_name: string;
    school_tagline: string;
    login_bg_mode: 'color' | 'image';
    login_bg_color: string;
    login_bg_image_url: string | null;
};

export type TenantSubscription = {
    status: string;
    plan: string;
    trial_ends_at: string | null;
    trial_days_remaining: number;
} | null;

export type Theme = {
    id: string;
    name: string;
    description: string;
    colors: Record<string, string>;
};

export type Feedback = {
    id: string;
    type: 'bug' | 'concern';
    title: string;
    description: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'closed';
    admin_response: string | null;
    responded_at: string | null;
    created_at: string;
};

export interface PageProps extends Record<string, unknown> {
    name: string;
    version: string;
    auth: Auth;
    unread_count: number;
    notifications: Array<{
        id: string;
        title: string;
        message: string;
        action_url: string;
        read_at: string | null;
        created_at: string;
    }>;
    can: Can;
    sidebarOpen: boolean;
    tenantSubscription: TenantSubscription;
    tenant: Tenant | null;
    availableThemes: Theme[];
    flash: {
        success: string | null;
        error: string | null;
        warning: string | null;
        info: string | null;
    };
}

export type * from './auth';
export type * from './navigation';
export type * from './ui';
