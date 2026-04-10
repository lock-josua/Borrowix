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
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/super-admin/dashboard' },
    { title: 'Promo Codes', href: '/super-admin/promo-codes' },
    { title: 'Create', href: '/super-admin/promo-codes/create' },
];

export default function CreatePromoCode() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        applicable_plan: 'all',
        max_uses: '',
        expires_at: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/super-admin/promo-codes');
    }

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Promo Code" />

            <div className="flex flex-col gap-6 p-6">
                <PageHeader
                    backHref="/super-admin/promo-codes"
                    title="Create Promo Code"
                    description="Add a new discount code for schools."
                />

                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle className="text-base">Code Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Code</Label>
                                <Input
                                    placeholder="Enter promo code"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                    className="font-mono uppercase"
                                />
                                {errors.code && (
                                    <p className="text-xs text-destructive">{errors.code}</p>
                                )}
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
                                    onValueChange={(v) => setData('discount_type', v)}
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
                                    placeholder={data.discount_type === 'percentage' ? '50' : '100'}
                                    value={data.discount_value}
                                    onChange={(e) => setData('discount_value', e.target.value)}
                                />
                                {errors.discount_value && (
                                    <p className="text-xs text-destructive">{errors.discount_value}</p>
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

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    )}
                                    {processing ? 'Creating...' : 'Create Code'}
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