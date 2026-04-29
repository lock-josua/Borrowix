import type { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export const statusStyles: Record<string, { bg: string; text: string }> = {
    available: { bg: '#DCFCE7', text: '#166534' },
    pending: { bg: '#FEF9C3', text: '#854D0E' },
    borrowed: { bg: '#FEF9C3', text: '#854D0E' },
    overdue: { bg: '#FEE2E2', text: '#991B1B' },
    reserved: { bg: '#F3E8FF', text: '#6B21A8' },
    under_repair: { bg: '#E0F2FE', text: '#075985' },
    retired: { bg: '#F1F5F9', text: '#475569' },
    approved: { bg: '#DCFCE7', text: '#166534' },
    rejected: { bg: '#FEE2E2', text: '#991B1B' },
    canceled: { bg: '#F1F5F9', text: '#475569' },
    active: { bg: '#E0F2FE', text: '#075985' },
    returned: { bg: '#DCFCE7', text: '#166534' },
    interview: { bg: '#F3E8FF', text: '#6B21A8' },
};

export function StatusBadge({ status }: { status: string }) {
    const s = statusStyles[status?.toLowerCase()] ?? {
        bg: '#E2E8F0',
        text: '#4A5568',
    };
    return (
        <span
            style={{ background: s.bg, color: s.text }}
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap capitalize"
        >
            {status?.replace(/_/g, ' ')}
        </span>
    );
}
export function formatDate(dateString: string | null | undefined): string {
    if (!dateString) {
        return '—';
    }

    try {
        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return '—';
        }

        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(date);
    } catch {
        return '—';
    }
}

export function formatDateOnly(dateString: string | null | undefined): string {
    if (!dateString) {
        return '—';
    }

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return '—';
        }

        return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }).format(date);
    } catch {
        return '—';
    }
}
