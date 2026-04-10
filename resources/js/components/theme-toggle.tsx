import { Check, Monitor, Moon, Palette, Sun } from 'lucide-react';
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

const appearanceOptions: { value: Appearance; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
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

    const ActiveIcon =
        appearanceOptions.find((opt) => opt.value === appearance)?.icon ?? Monitor;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ActiveIcon className="size-4" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom">
                {appearanceOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onSelect={() => updateAppearance(option.value)}
                        data-active={
                            appearance === option.value ? '' : undefined
                        }
                    >
                        <option.icon className="mr-2 size-4" />
                        {option.label}
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Palette className="size-3.5" />
                    Color Theme
                </DropdownMenuLabel>

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
    );
}
