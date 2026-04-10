import { useCallback, useSyncExternalStore } from 'react';

export type ColorTheme = 'navy' | 'emerald' | 'rose' | 'violet';

export const THEME_LABELS: Record<ColorTheme, string> = {
    navy: 'Navy',
    emerald: 'Emerald',
    rose: 'Rose',
    violet: 'Violet',
};

export const THEME_COLORS: Record<ColorTheme, string> = {
    navy: '#1E3A5F',
    emerald: '#065F46',
    rose: '#9F1239',
    violet: '#5B21B6',
};

export type UseThemeReturn = {
    readonly theme: ColorTheme;
    readonly setTheme: (theme: ColorTheme) => void;
};

const STORAGE_KEY = 'color-theme';
const listeners = new Set<() => void>();
let currentTheme: ColorTheme = 'navy';

const getStoredTheme = (): ColorTheme => {
    if (typeof window === 'undefined') return 'navy';

    return (localStorage.getItem(STORAGE_KEY) as ColorTheme) || 'navy';
};

const applyTheme = (theme: ColorTheme): void => {
    if (typeof document === 'undefined') return;

    if (theme === 'navy') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const notify = (): void => listeners.forEach((listener) => listener());

export function initializeColorTheme(): void {
    if (typeof window === 'undefined') return;

    currentTheme = getStoredTheme();
    applyTheme(currentTheme);
}

export function useTheme(): UseThemeReturn {
    const theme: ColorTheme = useSyncExternalStore(
        subscribe,
        () => currentTheme,
        () => 'navy',
    );

    const setTheme = useCallback((newTheme: ColorTheme): void => {
        currentTheme = newTheme;

        localStorage.setItem(STORAGE_KEY, newTheme);
        applyTheme(newTheme);
        notify();
    }, []);

    return { theme, setTheme } as const;
}
