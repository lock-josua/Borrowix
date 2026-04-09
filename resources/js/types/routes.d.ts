import type { InertiaLinkProps, Method } from '@inertiajs/react';

type RouteDefinition = {
    url: NonNullable<InertiaLinkProps['href']>;
    method: Method;
};

type RouteQueryOptions = {
    query?: Record<string, unknown>;
    mergeQuery?: Record<string, unknown>;
};

type RouteFormDefinition = {
    action: string;
    method: Method;
};

type RouteFunction = {
    (options?: RouteQueryOptions): RouteDefinition;
    url(options?: RouteQueryOptions): string;
    form(options?: RouteQueryOptions): RouteFormDefinition;
    definition: RouteDefinition;
};

declare module '@/routes' {
    export const login: RouteFunction;
    export const logout: RouteFunction;
    export const register: RouteFunction;
}

declare module '@/routes/tenant' {
    export const dashboard: RouteFunction;
}

declare module '@/routes/two-factor' {
    export const login: RouteFunction;
    export const enable: RouteFunction;
    export const confirm: RouteFunction;
    export const disable: RouteFunction;
    export const qrCode: RouteFunction;
    export const secretKey: RouteFunction;
    export const recoveryCodes: RouteFunction;
    export const regenerateRecoveryCodes: RouteFunction;
    export const show: RouteFunction;
}

declare module '@/routes/two-factor/login' {
    export const store: RouteFunction;
}

declare module '@/routes/profile' {
    export const edit: RouteFunction;
    export const update: RouteFunction;
    export const destroy: RouteFunction;
}

declare module '@/routes/verification' {
    export const send: RouteFunction;
}

declare module '@/routes/user-password' {
    export const edit: RouteFunction;
    export const update: RouteFunction;
}

declare module '@/routes/appearance' {
    export const edit: RouteFunction;
    export const update: RouteFunction;
}

declare module '@/routes/password' {
    export const request: RouteFunction;
    export const reset: RouteFunction;
    export const email: RouteFunction;
    export const update: RouteFunction;
    export const confirm: RouteFunction;
    export const confirmation: RouteFunction;
}

declare module '@/routes/password/confirm' {
    export const store: RouteFunction;
}

declare module '@/routes/login' {
    export const store: RouteFunction;
}
