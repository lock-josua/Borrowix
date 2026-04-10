<?php

use App\Enums\BorrowRequestStatus;
use App\Enums\BorrowTransactionStatus;
use App\Models\Category;
use App\Models\Equipment;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    // Seed roles/permissions
    $this->seed(Database\Seeders\RolePermissionSeeder::class);

    // Create category if categories table exists
    if (Schema::hasTable('categories')) {
        $this->category = Category::factory()->create();
        $this->equipment = Equipment::factory()->create([
            'category_id' => $this->category->id,
            'available_quantity' => 5,
            'status' => 'available',
        ]);
    } else {
        $this->category = null;
        $this->equipment = null;
    }

    // Create test users
    $this->student = User::factory()->create(['role' => 'student']);
    $this->student->syncRoles(['student']);

    $this->staff = User::factory()->create(['role' => 'staff']);
    $this->staff->syncRoles(['staff']);

    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->admin->syncRoles(['admin']);
});

describe('User Role Tests', function () {
    test('student user has student role', function () {
        expect($this->student->role->value)->toBe('student');
    });

    test('staff user has staff role', function () {
        expect($this->staff->role->value)->toBe('staff');
    });

    test('admin user has admin role', function () {
        expect($this->admin->role->value)->toBe('admin');
    });

    test('student can be assigned student role', function () {
        expect($this->student->hasRole('student'))->toBeTrue();
    });

    test('staff can be assigned staff role', function () {
        expect($this->staff->hasRole('staff'))->toBeTrue();
    });

    test('admin can be assigned admin role', function () {
        expect($this->admin->hasRole('admin'))->toBeTrue();
    });

    test('student cannot approve requests based on role', function () {
        expect($this->student->hasRole('admin'))->toBeFalse();
        expect($this->student->hasRole('staff'))->toBeFalse();
    });
});

describe('User Factory Tests', function () {
    test('user factory creates valid user', function () {
        $user = User::factory()->create();
        expect($user->id)->toBeTruthy();
        expect($user->email)->toBeTruthy();
    });

    test('user factory can create student role', function () {
        $student = User::factory()->create(['role' => 'student']);
        expect($student->role->value)->toBe('student');
    });

    test('user factory can create staff role', function () {
        $staff = User::factory()->create(['role' => 'staff']);
        expect($staff->role->value)->toBe('staff');
    });

    test('user factory can create admin role', function () {
        $admin = User::factory()->create(['role' => 'admin']);
        expect($admin->role->value)->toBe('admin');
    });
});

describe('Equipment Model Tests', function () {
    beforeEach(function () {
        if (! Schema::hasTable('categories')) {
            $this->markTestSkipped('Categories table does not exist - tenant migrations not loaded');
        }
    });

    test('equipment factory creates valid equipment', function () {
        expect($this->equipment)->toBeTruthy();
        expect($this->equipment->name)->toBeTruthy();
    });

    test('equipment has category relationship', function () {
        expect($this->equipment->category)->toBeTruthy();
        expect($this->equipment->category->id)->toBe($this->category->id);
    });

    test('equipment available quantity can be updated', function () {
        $this->equipment->update(['available_quantity' => 3]);
        expect($this->equipment->fresh()->available_quantity)->toBe(3);
    });

    test('equipment status can be updated', function () {
        $this->equipment->update(['status' => 'unavailable']);
        expect($this->equipment->fresh()->status)->toBe('unavailable');
    });
});

describe('Borrow Request Status Enum Tests', function () {
    test('pending status exists', function () {
        expect(BorrowRequestStatus::Pending->value)->toBe('pending');
    });

    test('approved status exists', function () {
        expect(BorrowRequestStatus::Approved->value)->toBe('approved');
    });

    test('rejected status exists', function () {
        expect(BorrowRequestStatus::Rejected->value)->toBe('rejected');
    });

    test('canceled status exists', function () {
        expect(BorrowRequestStatus::Canceled->value)->toBe('canceled');
    });

    test('status can be compared using value', function () {
        $status = BorrowRequestStatus::Pending;
        expect($status->value)->toBe('pending');
        expect($status->value)->not->toBe('approved');
    });
});

describe('Borrow Transaction Status Enum Tests', function () {
    test('active status exists', function () {
        expect(BorrowTransactionStatus::Active->value)->toBe('active');
    });

    test('returned status exists', function () {
        expect(BorrowTransactionStatus::Returned->value)->toBe('returned');
    });

    test('overdue status exists', function () {
        expect(BorrowTransactionStatus::Overdue->value)->toBe('overdue');
    });

    test('status can be compared using value', function () {
        $status = BorrowTransactionStatus::Active;
        expect($status->value)->toBe('active');
        expect($status->value)->not->toBe('returned');
    });
});

describe('Permission Tests', function () {
    test('admin has all permissions', function () {
        expect($this->admin->hasPermissionTo('request.viewAny'))->toBeTrue();
        expect($this->admin->hasPermissionTo('request.approve'))->toBeTrue();
        expect($this->admin->hasPermissionTo('transaction.viewAny'))->toBeTrue();
        expect($this->admin->hasPermissionTo('transaction.return'))->toBeTrue();
    });

    test('staff has specific permissions', function () {
        expect($this->staff->hasPermissionTo('transaction.viewAny'))->toBeTrue();
        expect($this->staff->hasPermissionTo('transaction.return'))->toBeTrue();
    });

    test('student has limited permissions', function () {
        expect($this->student->hasPermissionTo('request.create'))->toBeTrue();
    });

    test('student cannot approve requests', function () {
        expect($this->student->hasPermissionTo('request.approve'))->toBeFalse();
    });

    test('student cannot return items', function () {
        expect($this->student->hasPermissionTo('transaction.return'))->toBeFalse();
    });
});
