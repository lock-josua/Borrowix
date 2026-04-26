import { Head } from '@inertiajs/react';
import {
    ArrowUpCircle,
    CheckCircle2,
    ExternalLink,
    Loader2,
    RefreshCw,
    Tag,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AdminLayout from '@/layouts/AdminLayout';
import AdminSettingsLayout from '@/layouts/admin/AdminSettingsLayout';
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
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Settings', href: '/admin/settings/general' },
    { title: 'Updates', href: '/admin/settings/updates' },
];

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function AdminUpdates({ updateStatus }: Props) {
    const [status, setStatus] = useState<UpdateStatus>(updateStatus);
    const [checking, setChecking] = useState(false);

    async function handleCheck() {
        setChecking(true);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content ?? '';

            const res = await fetch('/admin/settings/updates/check', {
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
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Updates — Settings" />

            <div className="flex flex-col gap-6 p-6">
                <AdminSettingsLayout>
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
                                        className="text-xs"
                                    >
                                        Newer version available
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
                                    Latest Release
                                </CardDescription>
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <ArrowUpCircle className="size-5 text-muted-foreground" />
                                    {status.latest_version
                                        ? `v${status.latest_version}`
                                        : '—'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {status.published_at && (
                                    <span className="text-xs text-muted-foreground">
                                        Released{' '}
                                        {formatDate(status.published_at)}
                                    </span>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Release notes */}
                    {status.changelog && (
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle className="text-sm font-semibold">
                                    {status.latest_name ??
                                        `v${status.latest_version}`}{' '}
                                    — Release Notes
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
                            disabled={checking}
                            onClick={handleCheck}
                        >
                            {checking ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 size-4" />
                            )}
                            Check for updates
                        </Button>

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
                </AdminSettingsLayout>
            </div>
        </AdminLayout>
    );
}
