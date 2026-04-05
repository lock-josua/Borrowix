import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Copy,
    Eye,
    Plus,
    School,
    ShieldAlert,
    ShieldCheck,
    Search,
    ExternalLink,
    Check,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
    { title: 'Schools', href: '/super-admin/schools' },
];

interface School {
    id: string;
    name: string;
    email: string;
    plan: string;
    status: string;
    subdomain: string | null;
    school_url: string | null;
    created_at: string;
    users_count: number;
    equipment_count: number;
}

interface PaginatedSchools {
    data: School[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Credentials {
    admin_email: string;
    subdomain_url: string;
    login_url: string;
    reset_link: string;
}

interface Props {
    schools: PaginatedSchools;
    filters: { search?: string; plan?: string; status?: string };
}

const planBadge: Record<string, string> = {
    free: 'badge-ghost',
    basic: 'badge-info',
    pro: 'badge-warning',
};

const statusBadge: Record<string, string> = {
    active: 'badge-success',
    suspended: 'badge-error',
    canceled: 'badge-neutral',
};

export default function SchoolsIndex({ schools, filters }: Props) {
    const { flash } = usePage().props as {
        flash?: { credentials?: Credentials };
    };
    const [search, setSearch] = useState(filters.search ?? '');
    const [suspendTarget, setSuspendTarget] = useState<School | null>(null);
    const [reason, setReason] = useState('');
    const [showCredentials, setShowCredentials] = useState(false);
    const [credentials, setCredentials] = useState<Credentials | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        if (flash?.credentials) {
            setCredentials(flash.credentials);
            setShowCredentials(true);
        }
    }, [flash]);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/super-admin/schools', { search }, { preserveState: true });
    }

    function handleSuspend() {
        if (!suspendTarget) return;
        router.post(
            `/super-admin/schools/${suspendTarget.id}/suspend`,
            { reason },
            {
                onSuccess: () => {
                    setSuspendTarget(null);
                    setReason('');
                },
            },
        );
    }

    function handleReactivate(school: School) {
        router.post(`/super-admin/schools/${school.id}/reactivate`);
    }

    function handleCopy(value: string, key: string) {
        navigator.clipboard.writeText(value);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    }

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Schools" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header with inline search */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Schools
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            All registered schools on the platform.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                placeholder="Search name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-64"
                            />
                            <Button type="submit" variant="outline" size="icon">
                                <Search className="size-4" />
                            </Button>
                        </form>
                        <Link href="/super-admin/schools/create">
                            <Button>
                                <Plus className="mr-1 size-4" />
                                Add School
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Plan + Status filters */}
                <div className="flex flex-wrap items-center gap-2">
                    {['', 'free', 'basic', 'pro'].map((p) => (
                        <Button
                            key={p}
                            size="sm"
                            variant={
                                filters.plan === p ||
                                (!filters.plan && p === '')
                                    ? 'default'
                                    : 'outline'
                            }
                            onClick={() =>
                                router.get(
                                    '/super-admin/schools',
                                    { search, plan: p, status: filters.status },
                                    { preserveState: true },
                                )
                            }
                        >
                            {p === ''
                                ? 'All Plans'
                                : p.charAt(0).toUpperCase() + p.slice(1)}
                        </Button>
                    ))}
                    <div className="ml-4 flex gap-2">
                        {['', 'active', 'suspended'].map((s) => (
                            <Button
                                key={s}
                                size="sm"
                                variant={
                                    filters.status === s ||
                                    (!filters.status && s === '')
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() =>
                                    router.get(
                                        '/super-admin/schools',
                                        {
                                            search,
                                            plan: filters.plan,
                                            status: s,
                                        },
                                        { preserveState: true },
                                    )
                                }
                            >
                                {s === ''
                                    ? 'All Status'
                                    : s.charAt(0).toUpperCase() + s.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {schools.data.length} school
                            {schools.data.length !== 1 ? 's' : ''} found
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {schools.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <School className="mb-3 size-10 text-muted-foreground/40" />
                                <p className="font-medium text-muted-foreground">
                                    No schools found
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Try adjusting your search or filters.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    School
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Plan
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Users
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Equipment
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Joined
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {schools.data.map((school) => (
                                                <tr
                                                    key={school.id}
                                                    className="border-b transition-colors last:border-0 hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">
                                                            {school.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {school.email}
                                                        </div>
                                                        {school.school_url && (
                                                            <a
                                                                href={
                                                                    school.school_url
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                                            >
                                                                <ExternalLink className="size-3" />
                                                                {
                                                                    school.subdomain
                                                                }
                                                                .localhost
                                                            </a>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`badge badge-sm capitalize ${planBadge[school.plan] ?? 'badge-ghost'}`}
                                                        >
                                                            {school.plan}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`badge badge-sm capitalize ${statusBadge[school.status] ?? 'badge-ghost'}`}
                                                        >
                                                            {school.status.replace(
                                                                /_/g,
                                                                ' ',
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className="font-medium">
                                                            {school.users_count}
                                                        </span>
                                                        <span className="ml-1 text-xs text-muted-foreground">
                                                            users
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className="font-medium">
                                                            {
                                                                school.equipment_count
                                                            }
                                                        </span>
                                                        <span className="ml-1 text-xs text-muted-foreground">
                                                            items
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                                        {new Date(
                                                            school.created_at,
                                                        ).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            <Link
                                                                href={`/super-admin/schools/${school.id}`}
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                >
                                                                    <Eye className="mr-1 size-3.5" />
                                                                    View
                                                                </Button>
                                                            </Link>
                                                            {school.status ===
                                                            'active' ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-destructive hover:text-destructive"
                                                                    onClick={() =>
                                                                        setSuspendTarget(
                                                                            school,
                                                                        )
                                                                    }
                                                                >
                                                                    <ShieldAlert className="mr-1 size-3.5" />
                                                                    Suspend
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-emerald-600 hover:text-emerald-600"
                                                                    onClick={() =>
                                                                        handleReactivate(
                                                                            school,
                                                                        )
                                                                    }
                                                                >
                                                                    <ShieldCheck className="mr-1 size-3.5" />
                                                                    Reactivate
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {schools.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t pt-4">
                                        <p className="text-xs text-muted-foreground">
                                            Page {schools.current_page} of{' '}
                                            {schools.last_page}
                                        </p>
                                        <div className="flex gap-2">
                                            {schools.prev_page_url && (
                                                <Link
                                                    href={schools.prev_page_url}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        ← Previous
                                                    </Button>
                                                </Link>
                                            )}
                                            {schools.next_page_url && (
                                                <Link
                                                    href={schools.next_page_url}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Next →
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Suspend Dialog */}
            <Dialog
                open={!!suspendTarget}
                onOpenChange={() => setSuspendTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Suspend {suspendTarget?.name}?
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        All users of this school will be locked out immediately.
                    </p>
                    <Input
                        placeholder="Reason for suspension..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSuspendTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleSuspend}
                            disabled={!reason}
                        >
                            Suspend School
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Credentials Dialog */}
            <Dialog
                open={showCredentials}
                onOpenChange={(open) => {
                    setShowCredentials(open);
                    if (!open) setCredentials(null);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>School Created Successfully</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Share these credentials with the school.
                    </p>
                    {credentials && (
                        <div className="space-y-3">
                            <CredentialField
                                label="Admin Email"
                                value={credentials.admin_email}
                                copied={copied === 'email'}
                                onCopy={() =>
                                    handleCopy(credentials.admin_email, 'email')
                                }
                            />
                            <CredentialField
                                label="School URL"
                                value={credentials.subdomain_url}
                                copied={copied === 'subdomain'}
                                onCopy={() =>
                                    handleCopy(
                                        credentials.subdomain_url,
                                        'subdomain',
                                    )
                                }
                            />
                            <CredentialField
                                label="Login URL"
                                value={credentials.login_url}
                                copied={copied === 'login'}
                                onCopy={() =>
                                    handleCopy(credentials.login_url, 'login')
                                }
                            />
                            <CredentialField
                                label="Password Setup Link"
                                value={credentials.reset_link}
                                copied={copied === 'reset'}
                                onCopy={() =>
                                    handleCopy(credentials.reset_link, 'reset')
                                }
                                note="Link expires in 60 minutes."
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setShowCredentials(false)}>
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SuperAdminLayout>
    );
}

function CredentialField({
    label,
    value,
    copied,
    onCopy,
    note,
}: {
    label: string;
    value: string;
    copied: boolean;
    onCopy: () => void;
    note?: string;
}) {
    return (
        <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">
                {label}
            </div>
            <div className="flex items-center gap-2">
                <div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 font-mono text-xs break-all">
                    {value}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={onCopy}
                >
                    {copied ? (
                        <Check className="size-3.5 text-emerald-600" />
                    ) : (
                        <Copy className="size-3.5" />
                    )}
                </Button>
            </div>
            {note && <p className="text-xs text-muted-foreground">{note}</p>}
        </div>
    );
}
