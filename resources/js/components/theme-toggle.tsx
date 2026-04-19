import { Moon, Palette, Sun } from 'lucide-react';
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
import { cn } from '@/lib/utils';

export function ThemeToggle() {
    const { appearance, updateAppearance, theme, updateTheme } =
        useAppearance();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full border border-border"
                    aria-label="Change theme"
                >
                    <Palette className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Theme
                </DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => updateTheme('default')}
                    className={cn(
                        'cursor-pointer',
                        theme === 'default' && 'bg-accent/50',
                    )}
                >
                    <span
                        className="mr-2 size-2 rounded-full bg-primary"
                        style={{
                            backgroundColor: 'hsl(82.5414 88.2927% 59.8039%)',
                        }}
                    />
                    Default
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => updateTheme('sandstone')}
                    className={cn(
                        'cursor-pointer',
                        theme === 'sandstone' && 'bg-accent/50',
                    )}
                >
                    <span
                        className="mr-2 size-2 rounded-full"
                        style={{
                            backgroundColor: 'hsl(42.1519 100% 69.0196%)',
                        }}
                    />
                    Sandstone
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Appearance
                </DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => updateAppearance('light')}
                    className={cn(
                        'cursor-pointer',
                        appearance === 'light' && 'bg-accent/50',
                    )}
                >
                    <Sun className="mr-2 size-4" />
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => updateAppearance('dark')}
                    className={cn(
                        'cursor-pointer',
                        appearance === 'dark' && 'bg-accent/50',
                    )}
                >
                    <Moon className="mr-2 size-4" />
                    Dark
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
