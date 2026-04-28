import { useCallback, useMemo, useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';
export type Theme = 'default' | 'sandstone' | 'sesi' | 'whatsapp';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
    readonly theme: Theme;
    readonly updateTheme: (theme: Theme) => void;
};

const listeners = new Set<() => void>();
let currentAppearance: Appearance = 'system';
let currentTheme: Theme = 'default';

const prefersDark = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') return;
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getStoredAppearance = (): Appearance => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('appearance') as Appearance) || 'system';
};

const getStoredTheme = (): Theme => {
    if (typeof window === 'undefined') return 'default';
    return (localStorage.getItem('theme') as Theme) || 'default';
};

const isDarkMode = (appearance: Appearance): boolean =>
    appearance === 'dark' || (appearance === 'system' && prefersDark());

const applyAppearance = (appearance: Appearance): void => {
    if (typeof document === 'undefined') return;
    const isDark = isDarkMode(appearance);
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const applyTheme = (theme: Theme): void => {
    if (typeof document === 'undefined') return;
    if (theme === 'default') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
};

const notify = (): void => listeners.forEach((l) => l());

export function initializeTheme(): void {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem('appearance')) {
        localStorage.setItem('appearance', 'system');
        setCookie('appearance', 'system');
    }

    if (!localStorage.getItem('theme')) {
        localStorage.setItem('theme', 'default');
    }

    currentAppearance = getStoredAppearance();
    
    // Check if the server already set a theme (e.g., via Blade for tenants)
    const serverTheme = document.documentElement.getAttribute('data-theme') as Theme | null;
    if (serverTheme && ['default', 'sandstone', 'sesi', 'whatsapp'].includes(serverTheme)) {
        currentTheme = serverTheme;
    } else {
        currentTheme = getStoredTheme();
        applyTheme(currentTheme);
    }
    
    applyAppearance(currentAppearance);

    window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => {
            applyAppearance(currentAppearance);
            notify();
        });
}

export function useAppearance(): UseAppearanceReturn {
    const appearance: Appearance = useSyncExternalStore(
        subscribe,
        () => currentAppearance,
        () => 'system',
    );

    const theme: Theme = useSyncExternalStore(
        subscribe,
        () => currentTheme,
        () => 'default',
    );

    const resolvedAppearance: ResolvedAppearance = useMemo(
        () => (isDarkMode(appearance) ? 'dark' : 'light'),
        [appearance],
    );

    const updateAppearance = useCallback((mode: Appearance): void => {
        currentAppearance = mode;
        localStorage.setItem('appearance', mode);
        setCookie('appearance', mode);
        applyAppearance(mode);
        notify();
    }, []);

    const updateTheme = useCallback((newTheme: Theme): void => {
        currentTheme = newTheme;
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
        notify();
    }, []);

    return { 
        appearance, 
        resolvedAppearance, 
        updateAppearance,
        theme,
        updateTheme
    } as const;
}

