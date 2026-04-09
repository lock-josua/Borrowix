import type { ReactNode } from 'react';

export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-1 border-b border-border/50 last:border-0">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide min-w-[120px] flex-shrink-0">
                {label}
            </span>
            <span className="text-sm text-foreground text-right">{value}</span>
        </div>
    );
}
