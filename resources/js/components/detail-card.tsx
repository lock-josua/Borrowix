import type { ReactNode } from 'react';

export function DetailCard({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            </div>
            <div className="px-4 py-3 space-y-3">{children}</div>
        </div>
    );
}
