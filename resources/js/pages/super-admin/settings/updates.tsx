import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpCircle,
    Calendar,
    CheckCircle2,
    ExternalLink,
    Info,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import { formatDateOnly } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Release {
    version: string;
    tag_name: string;
    name: string;
    body: string;
    published_at: string | null;
    html_url: string;
    prerelease: boolean;
}

interface UpdateStatus {
    current_version: string;
    latest_version: string | null;
    has_update: boolean;
    latest_name: string | null;
    changelog: string | null;
    published_at: string | null;
    release_url: string | null;
    prerelease: boolean;
    all_releases: Release[];
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

export default function SuperAdminUpdates({ updateStatus }: Props) {
    const [status, setStatus] = useState<UpdateStatus>(updateStatus);
    const [checking, setChecking] = useState(false);
    const [installing, setInstalling] = useState(false);
    const [selectedRelease, setSelectedRelease] = useState<Release | null>(
        null,
    );

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
                                    Released{' '}
                                    {formatDateOnly(status.published_at)}
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

                {/* All Versions History */}
                <Card className="mt-6 overflow-hidden border-none shadow-sm ring-1 ring-border">
                    <CardHeader className="bg-muted/30 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold tracking-tight">
                                    Version History
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    Track all previous and upcoming releases for
                                    Borrowix.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="font-mono">
                                Total: {status.all_releases.length}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="px-6 py-3 font-semibold text-foreground">
                                        Release
                                    </TableHead>
                                    <TableHead className="px-6 py-3 font-semibold text-foreground">
                                        Published Date
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-right font-semibold text-foreground">
                                        Type
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {status.all_releases.length > 0 ? (
                                    status.all_releases.map((rel) => (
                                        <TableRow
                                            key={rel.version}
                                            className="group transition-colors hover:bg-muted/40"
                                        >
                                            <TableCell className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base font-bold tracking-tight text-foreground">
                                                            v{rel.version}
                                                        </span>
                                                        {rel.version ===
                                                            status.current_version && (
                                                            <Badge className="border-none bg-emerald-100 px-2 py-0 text-[10px] font-bold tracking-wider text-emerald-700 uppercase hover:bg-emerald-100/80">
                                                                Installed
                                                            </Badge>
                                                        )}
                                                        <button
                                                            onClick={() =>
                                                                setSelectedRelease(
                                                                    rel,
                                                                )
                                                            }
                                                            className="inline-flex size-6 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                                                            title="View Release Notes"
                                                        >
                                                            <Info className="size-3.5" />
                                                        </button>
                                                    </div>
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        {rel.name ||
                                                            rel.tag_name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar className="size-3.5" />
                                                    <span className="text-sm font-medium">
                                                        {formatDateOnly(
                                                            rel.published_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                {rel.prerelease ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="rounded-full border-amber-200 bg-amber-50 px-3 text-amber-600 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                                                    >
                                                        Pre-release
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="rounded-full border-blue-200 bg-blue-50 px-3 text-blue-600 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                                    >
                                                        Stable
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="size-6 animate-spin text-muted-foreground/30" />
                                                <p className="text-sm font-medium">
                                                    No releases found.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Release Notes Modal */}
                <Dialog
                    open={!!selectedRelease}
                    onOpenChange={(open) => !open && setSelectedRelease(null)}
                >
                    <DialogContent className="max-w-2xl gap-0 overflow-hidden border-none p-0 shadow-2xl ring-1 ring-border">
                        <DialogHeader className="bg-muted/30 p-6 pb-4">
                            <div className="flex flex-col gap-1">
                                <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
                                    v{selectedRelease?.version}
                                    <span className="font-normal text-muted-foreground">
                                        —
                                    </span>
                                    {selectedRelease?.name ||
                                        selectedRelease?.tag_name}
                                </DialogTitle>
                                <DialogDescription className="flex items-center gap-2 text-sm">
                                    <Calendar className="size-3.5" />
                                    Released on{' '}
                                    {formatDateOnly(
                                        selectedRelease?.published_at ?? '',
                                    )}
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <ScrollArea className="max-h-[65vh]">
                            <div className="p-6 pt-2">
                                <div className="rounded-xl border bg-muted/20 p-5">
                                    <pre className="font-sans text-sm leading-relaxed tracking-tight whitespace-pre-wrap text-foreground/90">
                                        {selectedRelease?.body ||
                                            'No release notes provided for this version.'}
                                    </pre>
                                </div>
                                {selectedRelease?.html_url && (
                                    <div className="mt-4 flex justify-end">
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-auto p-0 text-muted-foreground hover:text-foreground"
                                            asChild
                                        >
                                            <a
                                                href={selectedRelease.html_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2"
                                            >
                                                View on GitHub
                                                <ExternalLink className="size-3" />
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>

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
                    Last checked: {formatDateOnly(status.checked_at)}
                </p>
            </div>
        </SuperAdminLayout>
    );
}
