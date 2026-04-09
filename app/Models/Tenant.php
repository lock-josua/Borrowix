<?php

namespace App\Models;

use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains, \Stancl\Tenancy\Database\Concerns\TenantRun;

    /**
     * Columns that have dedicated DB columns in the central `tenants` table.
     * Everything else set on this model is stored in the `data` JSON column.
     *
     * Dedicated columns:
     *   - id             : tenant slug used as DB name prefix (e.g. "demo-school")
     *   - school_email   : the school's official contact email address
     *   - admin_email    : the admin user's login email address
     *   - contact_number : the school's phone/contact number
     *
     * Stored in JSON `data` column (no dedicated column):
     *   - school_name, plan, status, address, logo, etc.
     *
     * Always keep 'id' in this list.
     */
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'school_email',
            'admin_email',
            'contact_number',
        ];
    }
}
