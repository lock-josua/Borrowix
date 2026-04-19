import type { Auth, Can } from '@/types/auth';

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
            [key: string]: unknown;
        };
    }
}
