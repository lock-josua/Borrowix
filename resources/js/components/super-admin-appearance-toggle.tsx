import { Monitor, Moon, Sun, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import type { Theme, Appearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export function SuperAdminAppearanceToggle() {
    const { appearance, updateAppearance, theme, updateTheme } = useAppearance();

    const themes: { value: Theme; label: string }[] = [
        { value: 'default', label: 'Default' },
        { value: 'sandstone', label: 'Sandstone' },
        { value: 'sesi', label: 'Sesi' },
        { value: 'whatsapp', label: 'Whatsapp' },
    ];

    const appearances: { value: Appearance; label: string; icon: typeof Sun }[] = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full border border-border"
                    aria-label="Change appearance and theme"
                >
                    <Palette className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-48">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Customize
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-2 py-1.5">
                    Theme
                </DropdownMenuLabel>
                {themes.map((t) => (
                    <DropdownMenuItem
                        key={t.value}
                        onClick={() => updateTheme(t.value)}
                        className="cursor-pointer flex items-center justify-between"
                    >
                        <span>{t.label}</span>
                        {theme === t.value && <Check className="size-3.5 text-primary" />}
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-2 py-1.5">
                    Appearance
                </DropdownMenuLabel>
                {appearances.map((a) => (
                    <DropdownMenuItem
                        key={a.value}
                        onClick={() => updateAppearance(a.value)}
                        className={cn(
                            'cursor-pointer flex items-center justify-between',
                            appearance === a.value && 'bg-accent/50'
                        )}
                    >
                        <div className="flex items-center">
                            <a.icon className="mr-2 size-4" />
                            {a.label}
                        </div>
                        {appearance === a.value && <Check className="size-3.5 text-primary" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
