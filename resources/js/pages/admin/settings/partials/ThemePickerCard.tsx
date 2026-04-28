import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ThemeOption {
    slug: string;
    label: string;
    swatch_hex: string;
}

interface Props {
    themes: ThemeOption[];
    value: string;
    onChange: (slug: string) => void;
    disabled?: boolean;
}

export function ThemePickerCard({
    themes,
    value,
    onChange,
    disabled = false,
}: Props) {
    const activeHex =
        themes.find((t) => t.slug === value)?.swatch_hex ?? '#EA580C';

    return (
        <div className="space-y-5">
            {/* Swatch grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {themes.map((theme) => {
                    const isSelected = value === theme.slug;
                    return (
                        <button
                            key={theme.slug}
                            type="button"
                            onClick={() => onChange(theme.slug)}
                            disabled={disabled}
                            className={cn(
                                'relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all',
                                isSelected
                                    ? 'border-foreground shadow-sm'
                                    : 'border-border',
                                disabled
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'hover:border-foreground/40',
                            )}
                        >
                            <span
                                className="size-10 rounded-full shadow-inner"
                                style={{ backgroundColor: theme.swatch_hex }}
                            />
                            <span className="text-xs font-medium">
                                {theme.label}
                            </span>
                            {isSelected && (
                                <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-foreground text-background">
                                    <Check className="size-2.5" />
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Live preview */}
            <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Preview</p>
                <div className="flex gap-3 rounded-lg border p-4">
                    <button
                        type="button"
                        className="rounded px-3 py-1 text-sm font-medium text-white"
                        style={{ backgroundColor: activeHex }}
                    >
                        Button
                    </button>
                    <span
                        className="rounded px-2 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: activeHex }}
                    >
                        Badge
                    </span>
                </div>
            </div>
        </div>
    );
}
