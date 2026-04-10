import { Badge } from '@/components/ui/badge';

const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    available: { variant: 'default', label: 'Available' },
    borrowed: { variant: 'secondary', label: 'Borrowed' },
    pending: { variant: 'outline', label: 'Pending' },
    approved: { variant: 'default', label: 'Approved' },
    rejected: { variant: 'destructive', label: 'Rejected' },
    overdue: { variant: 'destructive', label: 'Overdue' },
    reserved: { variant: 'secondary', label: 'Reserved' },
    under_repair: { variant: 'outline', label: 'Under Repair' },
    retired: { variant: 'secondary', label: 'Retired' },
    canceled: { variant: 'secondary', label: 'Canceled' },
    returned: { variant: 'default', label: 'Returned' },
    active: { variant: 'default', label: 'Active' },
    suspended: { variant: 'destructive', label: 'Suspended' },
    free: { variant: 'secondary', label: 'Free' },
    basic: { variant: 'outline', label: 'Basic' },
    pro: { variant: 'default', label: 'Pro' },
    past_due: { variant: 'destructive', label: 'Past Due' },
    trialing: { variant: 'outline', label: 'Trialing' },
    paused: { variant: 'secondary', label: 'Paused' },
    // User roles
    admin: { variant: 'default', label: 'Admin' },
    staff: { variant: 'secondary', label: 'Staff' },
    student: { variant: 'outline', label: 'Student' },
    // Verification
    verified: { variant: 'default', label: 'Verified' },
};

export function StatusBadge({ status }: { status: string }) {
    const s = statusMap[status?.toLowerCase()] ?? { variant: 'outline', label: status };
    return (
        <Badge variant={s.variant} className="capitalize text-xs font-medium">
            {s.label}
        </Badge>
    );
}
