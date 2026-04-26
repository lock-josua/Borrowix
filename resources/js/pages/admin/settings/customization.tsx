import { Head, useForm } from '@inertiajs/react';
import { ImageIcon, Loader2, Palette, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import AdminSettingsLayout from '@/layouts/admin/AdminSettingsLayout';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem } from '@/types';
import { ThemePickerCard, type ThemeOption } from './partials/ThemePickerCard';

interface CustomizationSettings {
    logo_url: string | null;
    login_bg_mode: string;
    login_bg_color: string;
    login_bg_image_url: string | null;
    primary_color: string;
    active_theme: string;
    school_tagline: string;
    allowed_proof_types: string;
    max_daily_requests: number;
    public_browse_enabled: boolean;
    maintenance_message: string;
}

interface Props {
    customization: CustomizationSettings;
    available_themes: ThemeOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Settings', href: '/admin/settings/customization' },
];

export default function CustomizationSettingsPage({ customization, available_themes }: Props) {
    const { data, setData, post, transform, processing, errors } = useForm({
        logo: null as File | null,
        login_bg_image: null as File | null,
        login_bg_mode: customization.login_bg_mode,
        login_bg_color: customization.login_bg_color,
        primary_color: customization.primary_color,
        active_theme: customization.active_theme ?? 'default',
        school_tagline: customization.school_tagline,
        allowed_proof_types: customization.allowed_proof_types,
        max_daily_requests: customization.max_daily_requests,
        public_browse_enabled: customization.public_browse_enabled,
        maintenance_message: customization.maintenance_message,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(customization.logo_url);
    const [bgImagePreview, setBgImagePreview] = useState<string | null>(
        customization.login_bg_image_url,
    );

    function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onload = (e) => setLogoPreview(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    function handleBgImageChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) {
            setData('login_bg_image', file);
            const reader = new FileReader();
            reader.onload = (e) => setBgImagePreview(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    function removeLogo() {
        setData('logo', null);
        setLogoPreview(null);
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        // Strip null file fields so Laravel doesn't receive empty strings.
        transform((data) => ({
            ...data,
            login_bg_image: data.login_bg_image ?? undefined,
            logo: data.logo ?? undefined,
        }));
        post('/admin/settings/customization', { forceFormData: true });
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <AdminSettingsLayout>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ── School Branding ─────────────────────────────── */}
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                                    <ImageIcon className="size-4 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-semibold">
                                        School Branding
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Customize your school's visual identity and tagline.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="divide-y divide-border">
                            {/* School Logo */}
                            <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">School Logo</p>
                                    <p className="text-xs text-muted-foreground">
                                        Displayed in the navigation and login page. PNG or SVG
                                        recommended.
                                    </p>
                                </div>

                                <div className="col-span-2 flex items-start gap-6">
                                    {/* Preview */}
                                    <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 transition-colors hover:border-primary/40">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="School Logo"
                                                className="size-full object-cover transition-transform hover:scale-105"
                                            />
                                        ) : (
                                            <Upload className="size-6 text-muted-foreground/50" />
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    document.getElementById('logo-input')?.click()
                                                }
                                                className="flex items-center gap-2"
                                            >
                                                <Upload className="size-3.5" />
                                                {logoPreview ? 'Change Logo' : 'Upload Logo'}
                                            </Button>

                                            {logoPreview && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={removeLogo}
                                                    className="flex items-center gap-2 text-destructive hover:bg-destructive/5 hover:text-destructive"
                                                >
                                                    <X className="size-3.5" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Max 2 MB · PNG, JPG, SVG, WEBP
                                        </p>
                                        {errors.logo && (
                                            <p className="text-xs text-destructive">{errors.logo}</p>
                                        )}
                                    </div>
                                </div>

                                <input
                                    id="logo-input"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleLogoChange}
                                />
                            </div>

                            {/* School Tagline */}
                            <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Tagline / Motto</p>
                                    <p className="text-xs text-muted-foreground">
                                        Shown on the login screen beneath your school name.
                                    </p>
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="school_tagline" className="sr-only">
                                        School Tagline
                                    </Label>
                                    <Input
                                        id="school_tagline"
                                        value={data.school_tagline}
                                        onChange={(e) => setData('school_tagline', e.target.value)}
                                        maxLength={150}
                                        placeholder="Enter your school's inspiring tagline…"
                                        className="text-sm"
                                    />
                                    <p className="text-right text-xs text-muted-foreground">
                                        {data.school_tagline.length} / 150
                                    </p>
                                    {errors.school_tagline && (
                                        <p className="text-xs text-destructive">
                                            {errors.school_tagline}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Login Background */}
                            <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Login Background</p>
                                    <p className="text-xs text-muted-foreground">
                                        Choose a solid color or an image for the login page
                                        background.
                                    </p>
                                </div>

                                <div className="col-span-2 space-y-3">
                                    {/* Tab switcher */}
                                    <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-sm">
                                        <button
                                            type="button"
                                            onClick={() => setData('login_bg_mode', 'color')}
                                            className={`rounded-md px-4 py-1.5 font-medium transition-colors ${
                                                data.login_bg_mode === 'color'
                                                    ? 'bg-background text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            Solid
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('login_bg_mode', 'image')}
                                            className={`rounded-md px-4 py-1.5 font-medium transition-colors ${
                                                data.login_bg_mode === 'image'
                                                    ? 'bg-background text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            Image
                                        </button>
                                    </div>

                                    {/* Preview box */}
                                    <div className="relative h-28 w-48 overflow-hidden rounded-xl border border-border shadow-sm">
                                        {data.login_bg_mode === 'color' ? (
                                            <div
                                                className="size-full"
                                                style={{ backgroundColor: data.login_bg_color }}
                                            />
                                        ) : bgImagePreview ? (
                                            <img
                                                src={bgImagePreview}
                                                alt="Login Background"
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-full flex-col items-center justify-center gap-2 bg-muted/30 text-muted-foreground/50">
                                                <Upload className="size-7" />
                                                <span className="text-xs">No image selected</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Controls beneath preview */}
                                    {data.login_bg_mode === 'color' && (
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={data.login_bg_color}
                                                onChange={(e) =>
                                                    setData('login_bg_color', e.target.value)
                                                }
                                                className="size-9 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
                                            />
                                            <Input
                                                value={data.login_bg_color}
                                                onChange={(e) =>
                                                    setData('login_bg_color', e.target.value)
                                                }
                                                className="w-36 font-mono text-sm"
                                                placeholder="#F9FAFB"
                                            />
                                        </div>
                                    )}

                                    {data.login_bg_mode === 'image' && (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    document
                                                        .getElementById('bg-image-input')
                                                        ?.click()
                                                }
                                                className="flex items-center gap-2"
                                            >
                                                <Upload className="size-3.5" />
                                                {bgImagePreview ? 'Change Image' : 'Upload Image'}
                                            </Button>

                                            <input
                                                id="bg-image-input"
                                                type="file"
                                                name="login_bg_image"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleBgImageChange}
                                            />
                                        </>
                                    )}

                                    {errors.login_bg_image && (
                                        <p className="text-xs text-destructive">
                                            {errors.login_bg_image}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Color Theme ─────────────────────────────────── */}
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                                    <Palette className="size-4 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-semibold">
                                        Color Theme
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Choose the primary color scheme used throughout the dashboard.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="py-6">
                            <ThemePickerCard
                                themes={available_themes}
                                value={data.active_theme}
                                onChange={(slug) => setData('active_theme', slug)}
                            />
                        </CardContent>
                    </Card>

                    {/* ── Save ────────────────────────────────────────── */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing} className="min-w-28">
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </AdminSettingsLayout>
        </AdminLayout>
    );
}