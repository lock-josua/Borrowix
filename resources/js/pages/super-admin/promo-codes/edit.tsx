import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
    { title: 'Promo Codes', href: '/super-admin/promo-codes' },
    { title: 'Edit', href: '' },
];

interface PromoCode {
    id: number;
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    applicable_plan: string | null;
    max_uses: number | null;
    times_used: number;
    is_active: boolean;
    expires_at: string | null;
}

interface Props {
    promoCode: PromoCode;
}

export default function EditPromoCode({ promoCode }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        description: promoCode.description || '',
        discount_type: promoCode.discount_type,
        discount_value: promoCode.discount_value.toString(),
        applicable_plan: promoCode.applicable_plan || 'all',
        max_uses: promoCode.max_uses?.toString() || '',
        is_active: promoCode.is_active,
        expires_at: promoCode.expires_at
            ? new Date(promoCode.expires_at).toISOString().split('T')[0]
            : '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/super-admin/promo-codes/${promoCode.id}`);
    }

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Promo Code" />

            <div className="flex flex-col gap-6 p-6">
                <PageHeader
                    backHref="/super-admin/promo-codes"
                    title="Edit Promo Code"
                    description="Update discount code details."
                />

                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle className="text-base">Code Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Code (Read Only) */}
                            <div className="space-y-1.5">
                                <Label>Code</Label>
                                <Input
                                    value={promoCode.code}
                                    disabled
                                    className="bg-muted font-mono uppercase"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label>
                                    Description{' '}
                                    <span className="text-muted-foreground">(optional)</span>
                                </Label>
                                <Input
                                    placeholder="Launch discount for early adopters"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Discount Type</Label>
                                <Select
                                    value={data.discount_type}
                                    onValueChange={(v: 'percentage' | 'fixed') =>
                                        setData('discount_type', v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount (₱)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>
                                    Discount Value{' '}
                                    <span className="text-muted-foreground">
                                        ({data.discount_type === 'percentage' ? '%' : '₱'})
                                    </span>
                                </Label>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder={
                                        data.discount_type === 'percentage' ? '50' : '100'
                                    }
                                    value={data.discount_value}
                                    onChange={(e) => setData('discount_value', e.target.value)}
                                />
                                {errors.discount_value && (
                                    <p className="text-xs text-destructive">
                                        {errors.discount_value}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label>
                                    Applicable Plan{' '}
                                    <span className="text-muted-foreground">(optional)</span>
                                </Label>
                                <Select
                                    value={data.applicable_plan}
                                    onValueChange={(v) => setData('applicable_plan', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All plans" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All plans</SelectItem>
                                        <SelectItem value="basic">Basic</SelectItem>
                                        <SelectItem value="pro">Pro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>
                                    Max Uses{' '}
                                    <span className="text-muted-foreground">
                                        (optional — blank = unlimited)
                                    </span>
                                </Label>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="100"
                                    value={data.max_uses}
                                    onChange={(e) => setData('max_uses', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label>
                                    Expiry Date{' '}
                                    <span className="text-muted-foreground">(optional)</span>
                                </Label>
                                <Input
                                    type="date"
                                    value={data.expires_at}
                                    onChange={(e) => setData('expires_at', e.target.value)}
                                />
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center justify-between rounded-lg border border-border p-3">
                                <div>
                                    <Label>Active</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable or disable this promo code
                                    </p>
                                </div>
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={(v) => setData('is_active', v)}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    )}
                                    {processing ? 'Updating...' : 'Update Code'}
                                </Button>
                                <Button variant="outline" type="button" asChild>
                                    <Link href="/super-admin/promo-codes">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
