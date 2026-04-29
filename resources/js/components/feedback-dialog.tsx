import { useForm } from '@inertiajs/react';
import { History, Clock, CheckCircle2 } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { Feedback } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            type: '',
            title: '',
            description: '',
        });

    const [history, setHistory] = useState<Feedback[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const response = await fetch('/tenant/feedback');
            if (response.ok) {
                const result = await response.json();
                setHistory(result);
            }
        } catch (error) {
            console.error('Failed to fetch feedback history:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchHistory();
        }
    }, [open]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/tenant/feedback', {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            reset();
            clearErrors();
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[500px] overflow-hidden p-0">
                <Tabs defaultValue="report" className="w-full">
                    <DialogHeader className="px-6 pt-6 pb-2">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-bold">
                                Feedback & Support
                            </DialogTitle>
                            <TabsList className="grid w-[200px] grid-cols-2">
                                <TabsTrigger value="report">Report</TabsTrigger>
                                <TabsTrigger value="history">
                                    History
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <DialogDescription className="mt-1.5">
                            Need help? Report a bug or share your thoughts with
                            us.
                        </DialogDescription>
                    </DialogHeader>

                    <TabsContent value="report" className="mt-0 p-6 pt-2">
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type of Issue</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value) =>
                                        setData('type', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="type"
                                        className={
                                            errors.type
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    >
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bug">
                                            Report a Bug
                                        </SelectItem>
                                        <SelectItem value="concern">
                                            General Concern
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && (
                                    <p className="text-xs text-destructive">
                                        {errors.type}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="Brief summary of the issue"
                                    className={
                                        errors.title ? 'border-destructive' : ''
                                    }
                                />
                                {errors.title && (
                                    <p className="text-xs text-destructive">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Please provide as much detail as possible..."
                                    rows={4}
                                    className={
                                        errors.description
                                            ? 'border-destructive'
                                            : ''
                                    }
                                />
                                {errors.description && (
                                    <p className="text-xs text-destructive">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !data.type ||
                                        !data.title ||
                                        !data.description
                                    }
                                >
                                    {processing ? 'Submitting...' : 'Submit'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>

                    <TabsContent value="history" className="mt-0 p-0">
                        <ScrollArea className="h-[400px] px-6 pb-6">
                            {isLoadingHistory ? (
                                <div className="flex h-[200px] items-center justify-center">
                                    <Clock className="mr-2 size-4 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Loading your history...
                                    </span>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="rounded-full bg-muted p-3">
                                        <History className="size-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="mt-4 text-sm font-semibold">
                                        No feedback yet
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Your reported bugs and concerns will
                                        appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4 py-4">
                                    {history.map((item) => (
                                        <div
                                            key={item.id}
                                            className="group relative rounded-xl border bg-card p-4 transition-all hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant={
                                                                item.type ===
                                                                'bug'
                                                                    ? 'destructive'
                                                                    : 'secondary'
                                                            }
                                                            className="h-5 px-1.5 text-[10px] tracking-wider uppercase"
                                                        >
                                                            {item.type}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {new Date(
                                                                item.created_at,
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm leading-none font-bold">
                                                        {item.title}
                                                    </h4>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className="capitalize"
                                                >
                                                    {item.status.replace(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </Badge>
                                            </div>
                                            <p className="mt-2.5 line-clamp-3 text-xs text-muted-foreground">
                                                {item.description}
                                            </p>

                                            {item.admin_response && (
                                                <div className="mt-4 rounded-lg border border-green-100 bg-green-50/50 p-3 dark:border-green-900/30 dark:bg-green-900/10">
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-700 dark:text-green-400">
                                                        <CheckCircle2 className="size-3" />
                                                        Admin Response
                                                    </div>
                                                    <p className="mt-1.5 text-xs text-foreground/90">
                                                        {item.admin_response}
                                                    </p>
                                                    {item.responded_at && (
                                                        <p className="mt-1 text-[10px] text-muted-foreground">
                                                            Responded on{' '}
                                                            {new Date(
                                                                item.responded_at,
                                                            ).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                        <div className="border-t px-6 py-4">
                            <Button
                                variant="ghost"
                                className="w-full text-xs"
                                onClick={() => handleOpenChange(false)}
                            >
                                Close History
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
