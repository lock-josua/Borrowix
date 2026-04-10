import { useForm } from '@inertiajs/react';
import { Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';

interface Equipment {
    id: number;
    name: string;
    brand: string | null;
    model: string | null;
    available_quantity: number;
    image_url: string | null;
    category: { name: string } | null;
}

interface Props {
    equipment: Equipment;
    isOpen: boolean;
    onClose: () => void;
}

export default function BorrowRequestModal({
    equipment,
    isOpen,
    onClose,
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        equipment_id: String(equipment.id),
        purpose: '',
        borrow_date: '',
        expected_return_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/student/borrow-requests', {
            onSuccess: () => {
                onClose();
                reset();
                toast.success('Borrow request submitted successfully.');
            },
            onError: (errors) => {
                if (errors.message) {
                    toast.error(errors.message);
                }
            },
        });
    };

    const handleClose = () => {
        onClose();
        reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Borrow Equipment</DialogTitle>
                    <DialogDescription>
                        Request to borrow this equipment.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Equipment Display */}
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                        <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                            {equipment.image_url ? (
                                <img
                                    src={equipment.image_url}
                                    className="h-full w-full object-cover"
                                    alt={equipment.name}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <Package className="size-5 text-muted-foreground/40" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                                {equipment.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {equipment.available_quantity} available
                            </p>
                        </div>
                    </div>

                    {/* Purpose */}
                    <div className="space-y-2">
                        <Label htmlFor="purpose">Purpose</Label>
                        <Textarea
                            id="purpose"
                            placeholder="Reason for borrowing..."
                            value={data.purpose}
                            onChange={(e) => setData('purpose', e.target.value)}
                            className="min-h-[80px]"
                        />
                        {errors.purpose && (
                            <p className="text-xs text-destructive">
                                {errors.purpose}
                            </p>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="borrow_date">
                                Borrow Date & Time
                            </Label>
                            <Input
                                id="borrow_date"
                                type="datetime-local"
                                value={data.borrow_date}
                                onChange={(e) =>
                                    setData('borrow_date', e.target.value)
                                }
                            />
                            {errors.borrow_date && (
                                <p className="text-xs text-destructive">
                                    {errors.borrow_date}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="return_date">
                                Expected Return Date & Time
                            </Label>
                            <Input
                                id="return_date"
                                type="datetime-local"
                                value={data.expected_return_date}
                                onChange={(e) =>
                                    setData(
                                        'expected_return_date',
                                        e.target.value,
                                    )
                                }
                            />
                            {errors.expected_return_date && (
                                <p className="text-xs text-destructive">
                                    {errors.expected_return_date}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            Submit Request
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
