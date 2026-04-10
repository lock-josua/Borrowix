import { usePage, router } from '@inertiajs/react';
import { Bell, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
    id: string;
    title: string;
    message: string;
    action_url: string;
    read_at: string | null;
    created_at: string;
}

export function NotificationBell() {
    const {
        notifications: propNotifications,
        unread_count: initialUnreadCount,
    } = usePage().props as {
        notifications?: Notification[];
        unread_count?: number;
    };
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount ?? 0);
    const [notifications, setNotifications] = useState<Notification[]>(
        propNotifications ?? [],
    );
    const [loading, setLoading] = useState(false);

    function fetchNotifications() {
        setLoading(true);
        fetch('/api/notifications')
            .then((res) => res.json())
            .then((data) => {
                setNotifications(data.notifications ?? []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }

    function handleOpen(isOpen: boolean) {
        // Notifications are loaded via Inertia props - no need to fetch again
        // API is still used for markAsRead and markAllAsRead actions
    }

    function handleNotificationClick(notification: Notification) {
        if (!notification.read_at) {
            fetch(`/api/notifications/${notification.id}/read`, {
                method: 'POST',
                credentials: 'include',
            }).then(() => {
                setUnreadCount((prev) => Math.max(0, prev - 1));
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id
                            ? { ...n, read_at: new Date().toISOString() }
                            : n,
                    ),
                );
            });
        }
        router.visit(notification.action_url);
    }

    function handleMarkAllRead() {
        fetch('/api/notifications/read-all', {
            method: 'POST',
            credentials: 'include',
        }).then(() => {
            setUnreadCount(0);
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: new Date().toISOString() })),
            );
        });
    }

    function formatTime(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }

    return (
        <DropdownMenu onOpenChange={handleOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-8 w-8"
                >
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 text-xs text-muted-foreground"
                            onClick={handleMarkAllRead}
                        >
                            <Check className="mr-1 size-3" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {loading ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                        Loading...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                        No notifications
                    </div>
                ) : (
                    <>
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className="flex cursor-pointer flex-col items-start gap-1 p-3"
                                onClick={() =>
                                    handleNotificationClick(notification)
                                }
                            >
                                <div className="flex w-full items-center justify-between">
                                    <span
                                        className={`text-sm font-medium ${
                                            !notification.read_at
                                                ? 'text-foreground'
                                                : 'text-muted-foreground'
                                        }`}
                                    >
                                        {notification.title}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatTime(notification.created_at)}
                                    </span>
                                </div>
                                <span className="line-clamp-2 text-xs text-muted-foreground">
                                    {notification.message}
                                </span>
                            </DropdownMenuItem>
                        ))}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
