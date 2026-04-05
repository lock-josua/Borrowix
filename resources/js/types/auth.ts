export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};

export type Can = {
    manage_equipment?: boolean;
    delete_equipment?: boolean;
    approve_requests?: boolean;
    create_request?: boolean;
    process_returns?: boolean;
    manage_users?: boolean;
    view_reports?: boolean;
    manage_rbac?: boolean;
};
