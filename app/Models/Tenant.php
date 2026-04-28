<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasOne;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains, \Stancl\Tenancy\Database\Concerns\TenantRun;

    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class, 'tenant_id', 'id')->latestOfMany();
    }

    /**
     * Columns that have dedicated DB columns in the central `tenants` table.
     * Everything else set on this model is automatically stored in the `data` JSON column
     * by the stancl/tenancy package — no extra code needed.
     *
     * RULE: Only add a column here if it was added as a real column in the tenants migration.
     * Do NOT add school_name, plan, status, address, academic_year, default_borrow_days,
     * timezone, or any other attribute that should live in `data` JSON.
     *
     * Dedicated DB columns (queryable directly with WHERE):
     *   - id             : tenant slug, used as DB name prefix (e.g. "demo-school")
     *   - school_email   : the school's official contact email address
     *   - admin_email    : the admin user's login email address
     *   - contact_number : the school's phone/contact number
     *   - logo_path      : Cloudinary URL for the school logo
     *   - login_bg_image : Cloudinary URL for the login page background image
     *   - login_bg_mode  : 'color' or 'image'
     *   - login_bg_color : hex color string for the login background
     *   - primary_color  : hex color string for the brand primary color
     *   - active_theme   : theme slug (see TenantThemeService)
     *   - school_tagline : short school tagline displayed in the UI
     *   - allowed_proof_types : comma-separated file extensions (e.g. 'jpg,png,pdf')
     *   - max_daily_requests  : integer cap on student borrow requests per day
     *   - public_browse_enabled : boolean, allows unauthenticated equipment browsing
     *   - maintenance_message   : string shown when the tenant is in maintenance mode
     *
     * JSON `data` column attributes (NOT queryable with direct WHERE — use JSON operators):
     *   - school_name, address, academic_year, default_borrow_days, timezone
     *   - plan, status (legacy, now superseded by the subscriptions table)
     */
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'school_email',
            'admin_email',
            'contact_number',
            // Tenant customization fields - stored as direct columns
            'logo_path',
            'login_bg_image',
            'login_bg_mode',
            'login_bg_color',
            'primary_color',
            'active_theme',
            'school_tagline',
            'allowed_proof_types',
            'max_daily_requests',
            'public_browse_enabled',
            'maintenance_message',
        ];
    }
}
