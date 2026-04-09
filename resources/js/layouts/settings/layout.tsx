import { Link } from '@inertiajs/react';
import { Lock, Palette, ShieldCheck, User } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { PageHeader } from '@/components/page-header';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';

const settingsNav = [
    { title: 'Profile', href: edit(), icon: User },
    { title: 'Password', href: editPassword(), icon: Lock },
    { title: 'Appearance', href: editAppearance(), icon: Palette },
    { title: 'Two-Factor', href: show(), icon: ShieldCheck },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
            <PageHeader
                title="Settings"
                description="Manage your account settings and preferences."
            />

            <div className="flex flex-col gap-8 lg:flex-row">
                <aside className="shrink-0 lg:w-48">
                    <nav className="flex flex-col gap-1">
                        {settingsNav.map((item) => {
                            const active = isCurrentUrl(item.href);
                            return (
                                <Link
                                    key={item.title}
                                    href={toUrl(item.href)}
                                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                                        active
                                            ? 'bg-muted font-medium text-foreground'
                                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                    }`}
                                >
                                    <item.icon className="size-4" />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <div className="min-w-0 flex-1 space-y-6">{children}</div>
            </div>
        </div>
    );
}
