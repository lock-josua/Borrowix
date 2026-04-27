<?php

namespace App\Services;

class TenantThemeService
{
    /**
     * Theme registry.
     *
     * Each entry maps a slug (stored in DB) to:
     *   - label        : Human-readable name shown in the picker
     *   - swatch_hex   : Hex color for the picker swatch (representative color)
     *   - data_theme   : The value to set on the <html data-theme="..."> attribute.
     *                    Use null for the default theme (no attribute needed — :root in app.css wins).
     *
     * To add a new theme:
     *   1. Add a [data-theme='your-slug'] block to resources/css/app.css
     *   2. Add an entry here with data_theme = 'your-slug'
     *   3. Add the slug to the validation rule in SettingsController::updateCustomization()
     */
    public static function themes(): array
    {
        return [
            'default' => [
                'label' => 'Default',
                'swatch_hex' => '#EA580C',
                'data_theme' => null,          // No data-theme attr — uses :root from app.css
            ],
            'sandstone' => [
                'label' => 'Sandstone',
                'swatch_hex' => '#c49a1e',     // Sandstone accent — hsl(42.15 100% 69%) ≈ warm gold
                'data_theme' => 'sandstone',   // Matches [data-theme='sandstone'] in app.css
            ],
            'sesi' => [
                'label' => 'Sesi',
                'swatch_hex' => '#1a408e',     // Sesi primary — hsl(219 70.6% 33.3%)
                'data_theme' => 'sesi',        // Matches [data-theme='sesi'] in app.css
            ],
        ];
    }

    public static function resolve(string $slug): array
    {
        return static::themes()[$slug] ?? static::themes()['default'];
    }

    /**
     * Returns the data-theme attribute value for a given slug.
     * Returns null for the default theme (no attribute should be set).
     */
    public static function dataThemeAttr(string $slug): ?string
    {
        return static::resolve($slug)['data_theme'];
    }

    /**
     * Returns the swatch hex for a given slug (used to auto-sync primary_color on save).
     */
    public static function swatchHex(string $slug): string
    {
        return static::resolve($slug)['swatch_hex'];
    }

    /**
     * Returns a flat list for the frontend theme picker.
     */
    public static function themesForFrontend(): array
    {
        return collect(static::themes())
            ->map(fn ($t, $slug) => [
                'slug' => $slug,
                'label' => $t['label'],
                'swatch_hex' => $t['swatch_hex'],
            ])
            ->values()
            ->all();
    }

    /**
     * Returns the slugs that are valid for validation rules.
     */
    public static function validSlugs(): array
    {
        return array_keys(static::themes());
    }
}
