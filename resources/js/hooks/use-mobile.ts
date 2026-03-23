import { useSyncExternalStore } from 'react';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

// ── Mobile (< 768px) ────────────────────────────────────────
const mobileMql =
    typeof window === 'undefined'
        ? undefined
        : window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

function mobileListener(callback: (event: MediaQueryListEvent) => void) {
    if (!mobileMql) return () => {};
    mobileMql.addEventListener('change', callback);
    return () => mobileMql.removeEventListener('change', callback);
}

function isMobile(): boolean {
    return mobileMql?.matches ?? false;
}

export function useIsMobile(): boolean {
    return useSyncExternalStore(mobileListener, isMobile, () => false);
}

// ── Tablet or below (< 1024px) — used for student bottom nav ─
const tabletMql =
    typeof window === 'undefined'
        ? undefined
        : window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`);

function tabletListener(callback: (event: MediaQueryListEvent) => void) {
    if (!tabletMql) return () => {};
    tabletMql.addEventListener('change', callback);
    return () => tabletMql.removeEventListener('change', callback);
}

function isTabletOrBelow(): boolean {
    return tabletMql?.matches ?? false;
}

export function useIsTabletOrBelow(): boolean {
    return useSyncExternalStore(tabletListener, isTabletOrBelow, () => false);
}
