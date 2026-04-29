import { Link } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { profile, updates } from './routes';

interface Props {
    children: React.ReactNode;
}

const tabs = [
    { title: 'Profile', href: profile },
    { title: 'Updates', href: updates },
];

export default function StaffSettingsLayout({ children }: Props) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <div className="flex flex-col gap-6 p-6">
            <PageHeader
                title="Settings"
                description="Manage your account settings."
            />

            <nav className="border-b border-border">
                <ul className="flex items-center gap-6">
                    {tabs.map((tab) => {
                        const active = isCurrentUrl(tab.href);

                        return (
                            <li key={tab.href}>
                                <Link
                                    href={tab.href}
                                    className={`inline-flex border-b-2 pb-2 text-sm font-medium transition-colors ${
                                        active
                                            ? 'border-primary text-foreground'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab.title}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {children}
        </div>
    );
}
