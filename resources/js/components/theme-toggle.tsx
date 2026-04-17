import { Check, Moon, Sun, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance, type Appearance } from '@/hooks/use-appearance';
import { useTheme, type ColorTheme } from '@/hooks/use-theme';

// Removed 'system' mode, only light and dark remain
const appearanceOptions: { value: Appearance; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
];

const themeOptions: { value: ColorTheme; label: string; color: string }[] = [
    { value: 'navy', label: 'Navy', color: '#1E3A5F' },
    { value: 'emerald', label: 'Emerald', color: '#065F46' },
    { value: 'rose', label: 'Rose', color: '#9F1239' },
    { value: 'violet', label: 'Violet', color: '#5B21B6' },
];

export function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();
    const { theme, setTheme } = useTheme();

    // Simple toggle between light and dark
    const isDark = appearance === 'dark';

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full border border-border"
                aria-label="Toggle theme"
                onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            >
                {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </Button>
            {/* Color theme dropdown remains if needed */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Palette className="size-4" />
                        <span className="sr-only">Toggle color theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom">
                    {themeOptions.map((option) => (
                        <DropdownMenuItem
                            key={option.value}
                            onSelect={() => setTheme(option.value)}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="size-3 shrink-0 rounded-full border border-border"
                                    style={{ backgroundColor: option.color }}
                                />
                                {option.label}
                            </div>
                            {theme === option.value && (
                                <Check className="size-3.5 text-primary" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
