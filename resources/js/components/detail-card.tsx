import type { ReactNode } from 'react';

export function DetailCard({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">
                    {title}
                </h3>
            </div>
            <div className="space-y-3 px-4 py-3">{children}</div>
        </div>
    );
}
