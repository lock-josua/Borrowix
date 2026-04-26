import type { ReactNode } from 'react';

export function DetailRow({
    label,
    value,
}: {
    label: string;
    value: ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-border/50 py-1 last:border-0">
            <span className="min-w-[120px] flex-shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </span>
            <span className="text-right text-sm text-foreground">{value}</span>
        </div>
    );
}
