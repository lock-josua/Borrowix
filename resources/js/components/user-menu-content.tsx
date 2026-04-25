import { Link, router } from '@inertiajs/react';
import { LogOut, Moon, Sun } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useAppearance } from '@/hooks/use-appearance';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const { appearance, updateAppearance } = useAppearance();
    // Color theme logic removed

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Appearance Switcher */}
            <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 py-1.5 pt-2 text-xs font-semibold">
                    Appearance
                </DropdownMenuLabel>
                <div className="px-2 py-1.5">
                    <div className="flex rounded-lg border bg-muted/50 p-1">
                        <button
                            type="button"
                            onClick={() => updateAppearance('light')}
                            className={`flex flex-1 items-center justify-center rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                                appearance === 'light'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Sun className="mr-1.5 size-3.5" />
                            Light
                        </button>
                        <button
                            type="button"
                            onClick={() => updateAppearance('dark')}
                            className={`flex flex-1 items-center justify-center rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                                appearance === 'dark'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Moon className="mr-1.5 size-3.5" />
                            Dark
                        </button>
                    </div>
                </div>
            </DropdownMenuGroup>

            
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer text-destructive focus:text-destructive"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2 size-4" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
