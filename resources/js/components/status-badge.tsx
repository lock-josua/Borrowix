import { Badge } from '@/components/ui/badge';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const statusMap: Record<string, { variant: BadgeVariant; label: string; className?: string }> = {
    available: { variant: 'default', label: 'Available', className: 'bg-emerald-600 text-white' },
    borrowed: { variant: 'secondary', label: 'Borrowed', className: 'bg-amber-500/15 text-amber-700 border border-amber-500/30 dark:text-amber-300' },
    pending: { variant: 'outline', label: 'Pending', className: 'border-amber-500/40 text-amber-600 dark:text-amber-300' },
    approved: { variant: 'default', label: 'Approved', className: 'bg-emerald-600 text-white' },
    rejected: { variant: 'destructive', label: 'Rejected' },
    overdue: { variant: 'destructive', label: 'Overdue' },
    reserved: { variant: 'secondary', label: 'Reserved', className: 'bg-sky-500/15 text-sky-700 border border-sky-500/30 dark:text-sky-300' },
    under_repair: { variant: 'outline', label: 'Under Repair', className: 'border-slate-400/40 text-slate-600 dark:text-slate-300' },
    retired: { variant: 'secondary', label: 'Retired', className: 'bg-slate-500/15 text-slate-700 border border-slate-500/30 dark:text-slate-300' },
    canceled: { variant: 'secondary', label: 'Canceled', className: 'bg-slate-500/15 text-slate-700 border border-slate-500/30 dark:text-slate-300' },
    returned: { variant: 'default', label: 'Returned', className: 'bg-emerald-600 text-white' },
    active: { variant: 'default', label: 'Active', className: 'bg-emerald-600 text-white' },
    suspended: { variant: 'secondary', label: 'Suspended', className: 'bg-slate-600 text-white' },
    // Subscription statuses
    subscribed: { variant: 'default', label: 'Subscribed', className: 'bg-emerald-600 text-white' },
    trial_expired: { variant: 'destructive', label: 'Trial Expired' },
    trialing: { variant: 'secondary', label: 'Trialing', className: 'bg-amber-500/15 text-amber-700 border border-amber-500/30 dark:text-amber-300' },
    // Payment statuses
    completed: { variant: 'default', label: 'Completed', className: 'bg-emerald-600 text-white' },
    failed: { variant: 'destructive', label: 'Failed' },
    refunded: { variant: 'secondary', label: 'Refunded', className: 'bg-slate-500/15 text-slate-700 border border-slate-500/30 dark:text-slate-300' },
    // User roles
    admin: { variant: 'default', label: 'Admin', className: 'bg-indigo-600 text-white' },
    staff: { variant: 'secondary', label: 'Staff', className: 'bg-sky-500/15 text-sky-700 border border-sky-500/30 dark:text-sky-300' },
    student: { variant: 'outline', label: 'Student', className: 'border-slate-400/40 text-slate-600 dark:text-slate-300' },
    // Verification
    verified: { variant: 'default', label: 'Verified', className: 'bg-emerald-600 text-white' },
};

export function StatusBadge({ status }: { status: string }) {
    const s = statusMap[status?.toLowerCase()] ?? { variant: 'outline', label: status };
    return (
        <Badge variant={s.variant} className={`capitalize text-xs font-medium ${s.className ?? ''}`}>
            {s.label}
        </Badge>
    );
}
