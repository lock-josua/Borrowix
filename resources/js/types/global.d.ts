import type { Auth, Can } from '@/types/auth';

export interface TenantProps {
    logo_url: string | null;
    primary_color: string;
    active_theme: string;
    school_name: string;
    school_tagline: string;
    login_bg_mode: 'color' | 'image';
    login_bg_color: string;
    login_bg_image_url: string | null;
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            version: string;
            auth: Auth;
            can: Can;
            sidebarOpen: boolean;
            flash: {
                success: string | null;
                error: string | null;
                warning: string | null;
                info: string | null;
            };
            tenant: TenantProps | null;
            availableThemes: Array<{ slug: string; label: string; swatch_hex: string }>;
            [key: string]: unknown;
        };
    }
}