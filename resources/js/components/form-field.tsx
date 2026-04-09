import type { ReactNode } from 'react';

export function FormField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
                {label}
                {required && <span className="text-destructive ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}
