import { usePage } from '@inertiajs/react';
import { Bell, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';
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
    const [selectedNotification, setSelectedNotification] =
        useState<Notification | null>(null);
    const [loading] = useState(false);

    function handleNotificationClick(notification: Notification) {
        if (!notification.read_at) {
            fetch(`/api/notifications/${notification.id}/read`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
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
        setSelectedNotification(notification);
    }

    function handleMarkAllRead() {
        fetch('/api/notifications/read-all', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/json',
            },
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
        <>
            <DropdownMenu>
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
                                            {formatTime(
                                                notification.created_at,
                                            )}
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

            <Dialog
                open={!!selectedNotification}
                onOpenChange={(open) => !open && setSelectedNotification(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bell className="size-5 text-primary" />
                            {selectedNotification?.title}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {selectedNotification &&
                                formatTime(selectedNotification.created_at)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 text-sm text-foreground">
                        {selectedNotification?.message}
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <div className="text-[10px] text-muted-foreground italic">
                            {selectedNotification?.created_at &&
                                new Date(
                                    selectedNotification.created_at,
                                ).toLocaleString()}
                        </div>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
