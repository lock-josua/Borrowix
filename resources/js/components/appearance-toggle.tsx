import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export function AppearanceToggle() {
    const { appearance, updateAppearance } = useAppearance();

    const icon =
        appearance === 'dark' ? (
            <Moon className="size-4" />
        ) : appearance === 'light' ? (
            <Sun className="size-4" />
        ) : (
            <Monitor className="size-4" />
        );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full border border-border"
                    aria-label="Change appearance"
                >
                    {icon}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Appearance
                </DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => updateAppearance('light')}
                    className={cn('cursor-pointer', appearance === 'light' && 'bg-accent/50')}
                >
                    <Sun className="mr-2 size-4" />
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => updateAppearance('dark')}
                    className={cn('cursor-pointer', appearance === 'dark' && 'bg-accent/50')}
                >
                    <Moon className="mr-2 size-4" />
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => updateAppearance('system')}
                    className={cn('cursor-pointer', appearance === 'system' && 'bg-accent/50')}
                >
                    <Monitor className="mr-2 size-4" />
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}