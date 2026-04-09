<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Models\Role as SpatieRole;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable {
        HasRoles::hasRole as spatieHasRole;
    }

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'role',
        // school_id REMOVED — no cross-DB relationships
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'role' => UserRole::class,
        ];
    }

    protected static function booted(): void
    {
        static::saved(function (self $user) {
            if ($user->wasChanged('role')) {
                $user->syncRoles([$user->role->value]);
            }
        });
    }

    // school() REMOVED — no cross-DB relationships
    // scopeForCurrentSchool() REMOVED — DB already switched by the package
    // isSuperAdmin() REMOVED — super_admin only exists in central DB, not tenant DB

    public function borrowRequests(): HasMany
    {
        return $this->hasMany(BorrowRequest::class);
    }

    public function borrowTransactions(): HasMany
    {
        return $this->hasMany(BorrowTransaction::class, 'borrower_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isStaff(): bool
    {
        return $this->role === UserRole::Staff;
    }

    public function isStudent(): bool
    {
        return $this->role === UserRole::Student;
    }

    /**
     * Checks the user's role column against the given role string.
     *
     * This method intentionally shadows Spatie's hasRole() to support
     * the role column as the source of truth for CheckRole middleware.
     * When Spatie internals pass a Collection or Role model (e.g. from
     * hasPermissionViaRole), we delegate to Spatie's trait implementation.
     */
    public function hasRole($role, ?string $guard = null): bool
    {
        if ($role instanceof Collection || $role instanceof SpatieRole) {
            return $this->spatieHasRole($role, $guard);
        }

        if (is_string($role)) {
            return $this->role->value === $role;
        }

        return $this->spatieHasRole($role, $guard);
    }
}
