import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpCircle,
    CheckCircle2,
    ExternalLink,
    Loader2,
    RefreshCw,
    Tag,
} from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

interface UpdateStatus {
    current_version: string;
    latest_version: string | null;
    has_update: boolean;
    latest_name: string | null;
    changelog: string | null;
    published_at: string | null;
    release_url: string | null;
    prerelease: boolean;
    checked_at: string;
}

interface Props {
    updateStatus: UpdateStatus;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
    { title: 'Settings', href: '/super-admin/settings' },
    { title: 'Updates', href: '/super-admin/settings/updates' },
];

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function SuperAdminUpdates({ updateStatus }: Props) {
    const [status, setStatus] = useState<UpdateStatus>(updateStatus);
    const [checking, setChecking] = useState(false);
    const [installing, setInstalling] = useState(false);

    function handleInstall() {
        if (
            confirm(
                `Are you sure you want to install v${status.latest_version}? This may take a moment.`,
            )
        ) {
            router.post(
                '/super-admin/settings/updates/install',
                {},
                {
                    onStart: () => setInstalling(true),
                    onFinish: () => setInstalling(false),
                },
            );
        }
    }

    async function handleCheck() {
        setChecking(true);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content ?? '';

            const res = await fetch('/super-admin/settings/updates/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            if (res.ok) {
                const fresh: UpdateStatus = await res.json();
                setStatus(fresh);
            }
        } finally {
            setChecking(false);
        }
    }

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Updates — Settings" />

            <div className="flex flex-col gap-6 p-6">
                <PageHeader
                    title="Settings"
                    description="Manage your account settings."
                />

                {/* Tab nav — matches the index.tsx tab style */}
                <nav className="border-b border-border">
                    <ul className="flex items-center gap-6">
                        <li>
                            <Link
                                href="/super-admin/settings"
                                className="inline-flex border-b-2 border-transparent pb-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Profile
                            </Link>
                        </li>
                        <li className="border-b-2 border-primary pb-2 text-sm font-semibold text-foreground">
                            Updates
                        </li>
                    </ul>
                </nav>

                {/* Version summary cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs">
                                Installed Version
                            </CardDescription>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Tag className="size-5 text-muted-foreground" />
                                v{status.current_version}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {status.has_update ? (
                                <Badge
                                    variant="destructive"
                                    className="cursor-pointer text-xs transition-colors hover:bg-destructive/80"
                                    onClick={handleInstall}
                                >
                                    Update available (Click to Install)
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="border-emerald-500 text-xs text-emerald-600"
                                >
                                    <CheckCircle2 className="mr-1 size-3" />
                                    Up to date
                                </Badge>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs">
                                Latest Release on GitHub
                            </CardDescription>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <ArrowUpCircle className="size-5 text-muted-foreground" />
                                {status.latest_version
                                    ? `v${status.latest_version}`
                                    : '—'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-2">
                            {status.published_at && (
                                <span className="text-xs text-muted-foreground">
                                    Released {formatDate(status.published_at)}
                                </span>
                            )}
                            {status.prerelease && (
                                <Badge variant="secondary" className="text-xs">
                                    Pre-release
                                </Badge>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Update banner — only shown when update is available */}
                {status.has_update && (
                    <Card className="border-amber-400 bg-amber-50 dark:bg-amber-950/20">
                        <CardHeader className="border-b border-amber-200 pb-3 dark:border-amber-800">
                            <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                🚀{' '}
                                {status.latest_name ??
                                    `v${status.latest_version}`}{' '}
                                is available
                            </CardTitle>
                            <CardDescription className="text-xs text-amber-700 dark:text-amber-400">
                                You are running v{status.current_version}.
                                Deploy the latest tag to update.
                            </CardDescription>
                        </CardHeader>
                        {status.changelog && (
                            <CardContent className="pt-4">
                                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Changelog
                                </p>
                                <pre className="rounded-md bg-muted/50 p-3 text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                                    {status.changelog}
                                </pre>
                            </CardContent>
                        )}
                    </Card>
                )}

                {/* Release notes when up to date */}
                {!status.has_update && status.changelog && (
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-sm font-semibold">
                                Latest Release Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <pre className="rounded-md bg-muted/50 p-3 text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                                {status.changelog}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={checking || installing}
                        onClick={handleCheck}
                    >
                        {checking ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 size-4" />
                        )}
                        Check for updates
                    </Button>

                    {status.has_update && (
                        <Button
                            variant="default"
                            size="sm"
                            disabled={checking || installing}
                            onClick={handleInstall}
                        >
                            {installing ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : (
                                <ArrowUpCircle className="mr-2 size-4" />
                            )}
                            Install Update
                        </Button>
                    )}

                    {status.release_url && (
                        <Button variant="ghost" size="sm" asChild>
                            <a
                                href={status.release_url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="mr-2 size-4" />
                                View on GitHub
                            </a>
                        </Button>
                    )}
                </div>

                <p className="text-xs text-muted-foreground">
                    Last checked: {formatDate(status.checked_at)}
                </p>
            </div>
        </SuperAdminLayout>
    );
}
