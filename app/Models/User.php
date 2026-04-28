<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Models\Role as SpatieRole;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, HasRoles, Notifiable, SoftDeletes, TwoFactorAuthenticatable {
        HasRoles::hasRole as spatieHasRole;
    }

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
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

    /**
     * IMPORTANT: Always update a user's role via $user->role = UserRole::X (then save).
     * The booted() observer below automatically syncs Spatie's model_has_roles table
     * whenever the role column changes.
     *
     * Never call $user->syncRoles() directly without also setting $user->role —
     * that would update Spatie's table but leave the role column out of sync,
     * causing hasRole() to return the wrong result since it reads from the column.
     *
     * The role column is the single source of truth. Spatie roles are a derived copy.
     */
    protected static function booted(): void
    {
        static::saved(function (self $user) {
            if ($user->isDirty('role')) {
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
     * Overrides Spatie's HasRoles::hasRole() to use the role column as the source of truth.
     * This is intentional — the role column is always in sync via the booted() observer,
     * and checking a single column is faster than a JOIN on model_has_roles.
     *
     * Spatie's original implementation is preserved as spatieHasRole() for cases where
     * Spatie internals pass a Collection or Role model object (e.g. permission checks via role).
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
