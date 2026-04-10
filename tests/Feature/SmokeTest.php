<?php

use App\Enums\BorrowRequestStatus;
use App\Enums\BorrowTransactionStatus;
use App\Enums\Permission;
use App\Models\BorrowRequest;
use App\Models\BorrowTransaction;
use App\Models\Category;
use App\Models\Equipment;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->seed(Database\Seeders\RolePermissionSeeder::class);

    // Create test users
    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->admin->syncRoles(['admin']);

    $this->staff = User::factory()->create(['role' => 'staff']);
    $this->staff->syncRoles(['staff']);

    $this->student = User::factory()->create(['role' => 'student']);
    $this->student->syncRoles(['student']);
});

describe('Smoke Test: Login and Authentication', function () {
    test('admin user can login successfully', function () {
        $response = $this->post(route('login.store'), [
            'email' => $this->admin->email,
            'password' => 'password',
        ]);

        $response->assertRedirect('/admin/dashboard');
        $this->assertAuthenticated();
    });

    test('staff user can login successfully', function () {
        $response = $this->post(route('login.store'), [
            'email' => $this->staff->email,
            'password' => 'password',
        ]);

        $response->assertRedirect('/staff/dashboard');
        $this->assertAuthenticated();
    });

    test('student user can login successfully', function () {
        $response = $this->post(route('login.store'), [
            'email' => $this->student->email,
            'password' => 'password',
        ]);

        $response->assertRedirect('/student/dashboard');
        $this->assertAuthenticated();
    });

    test('invalid credentials are rejected', function () {
        $response = $this->post(route('login.store'), [
            'email' => 'nonexistent@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    });

    test('user can logout', function () {
        $this->actingAs($this->admin);

        $response = $this->post(route('logout'));

        $this->assertGuest();
        $response->assertRedirect('/');
    });
});

describe('Smoke Test: Role-Based Access Control', function () {
    test('admin has all permissions', function () {
        expect($this->admin->hasPermissionTo(Permission::RequestApprove->value))->toBeTrue();
        expect($this->admin->hasPermissionTo(Permission::RequestReject->value))->toBeTrue();
        expect($this->admin->hasPermissionTo(Permission::TransactionReturn->value))->toBeTrue();
        expect($this->admin->hasPermissionTo(Permission::EquipmentCreate->value))->toBeTrue();
    });

    test('staff has limited permissions', function () {
        expect($this->staff->hasPermissionTo(Permission::TransactionReturn->value))->toBeTrue();
        expect($this->staff->hasPermissionTo(Permission::TransactionViewAny->value))->toBeTrue();
        expect($this->staff->hasPermissionTo(Permission::EquipmentCreate->value))->toBeFalse();
    });

    test('student has minimal permissions', function () {
        expect($this->student->hasPermissionTo(Permission::RequestCreate->value))->toBeTrue();
        expect($this->student->hasPermissionTo(Permission::RequestViewAny->value))->toBeTrue();
        expect($this->student->hasPermissionTo(Permission::RequestApprove->value))->toBeFalse();
        expect($this->student->hasPermissionTo(Permission::TransactionReturn->value))->toBeFalse();
    });
});

describe('Smoke Test: Borrow Request Flow', function () {
    beforeEach(function () {
        if (! Schema::hasTable('categories')) {
            $this->markTestSkipped('Tenant tables not available');
        }

        $this->category = Category::factory()->create();
        $this->equipment = Equipment::factory()->create([
            'category_id' => $this->category->id,
            'available_quantity' => 5,
            'status' => 'available',
        ]);
    });

    test('student can create a borrow request', function () {
        $response = $this->actingAs($this->student)->post(route('student.borrow-requests.store'), [
            'equipment_id' => $this->equipment->id,
            'purpose' => 'For class project',
            'borrow_date' => now()->addDay()->format('Y-m-d'),
            'expected_return_date' => now()->addDays(3)->format('Y-m-d'),
        ]);

        $response->assertRedirect(route('student.borrow-requests.index'));

        expect(BorrowRequest::where('user_id', $this->student->id)
            ->where('equipment_id', $this->equipment->id)
            ->exists())->toBeTrue();
    });

    test('admin can approve a pending borrow request', function () {
        $request = BorrowRequest::factory()->create([
            'user_id' => $this->student->id,
            'equipment_id' => $this->equipment->id,
            'status' => BorrowRequestStatus::Pending,
            'borrow_date' => now(),
            'expected_return_date' => now()->addDays(3),
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.requests.approve', $request));

        $response->assertRedirect(route('admin.requests.show', $request));

        expect($request->fresh()->status)->toBe(BorrowRequestStatus::Approved);
        expect(BorrowTransaction::where('borrow_request_id', $request->id)->count())->toBe(1);
    });

    test('admin can reject a pending borrow request', function () {
        $request = BorrowRequest::factory()->create([
            'user_id' => $this->student->id,
            'equipment_id' => $this->equipment->id,
            'status' => BorrowRequestStatus::Pending,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.requests.reject', $request), [
            'remarks' => 'Equipment under maintenance',
        ]);

        $response->assertRedirect(route('admin.requests.show', $request));

        expect($request->fresh()->status)->toBe(BorrowRequestStatus::Rejected);
    });
});

describe('Smoke Test: Transaction Return Flow', function () {
    beforeEach(function () {
        if (! Schema::hasTable('categories')) {
            $this->markTestSkipped('Tenant tables not available');
        }

        $this->category = Category::factory()->create();
        $this->equipment = Equipment::factory()->create([
            'category_id' => $this->category->id,
            'available_quantity' => 3,
            'status' => 'available',
        ]);
    });

    test('staff can mark transaction as returned', function () {
        $request = BorrowRequest::factory()->create([
            'status' => BorrowRequestStatus::Approved,
        ]);

        $transaction = BorrowTransaction::factory()->create([
            'borrow_request_id' => $request->id,
            'borrower_id' => $this->student->id,
            'equipment_id' => $this->equipment->id,
            'status' => BorrowTransactionStatus::Active,
            'due_date' => now()->addDays(3),
        ]);

        $originalAvailableQty = $this->equipment->available_quantity;

        $response = $this->actingAs($this->staff)->post(route('staff.transactions.return', $transaction), [
            'return_condition_notes' => 'Good condition',
        ]);

        $response->assertRedirect(route('staff.transactions.index'));

        expect($transaction->fresh()->status)->toBe(BorrowTransactionStatus::Returned);
        expect($transaction->fresh()->returned_at)->not->toBeNull();
        expect($this->equipment->fresh()->available_quantity)->toBe($originalAvailableQty + 1);
    });

    test('student cannot mark transaction as returned', function () {
        $request = BorrowRequest::factory()->create([
            'status' => BorrowRequestStatus::Approved,
        ]);

        $transaction = BorrowTransaction::factory()->create([
            'borrow_request_id' => $request->id,
            'borrower_id' => $this->student->id,
            'status' => BorrowTransactionStatus::Active,
        ]);

        $response = $this->actingAs($this->student)->post(route('staff.transactions.return', $transaction));

        $response->assertForbidden();
    });
});

describe('Smoke Test: Equipment Availability', function () {
    beforeEach(function () {
        if (! Schema::hasTable('categories')) {
            $this->markTestSkipped('Tenant tables not available');
        }

        $this->category = Category::factory()->create();
    });

    test('equipment available quantity decreases when borrowed', function () {
        $equipment = Equipment::factory()->create([
            'category_id' => $this->category->id,
            'quantity' => 10,
            'available_quantity' => 10,
            'status' => 'available',
        ]);

        expect($equipment->available_quantity)->toBe(10);

        $equipment->decrement('available_quantity');

        expect($equipment->fresh()->available_quantity)->toBe(9);
    });

    test('equipment becomes unavailable when all units borrowed', function () {
        $equipment = Equipment::factory()->create([
            'category_id' => $this->category->id,
            'quantity' => 5,
            'available_quantity' => 1,
            'status' => 'available',
        ]);

        $equipment->decrement('available_quantity');

        expect($equipment->fresh()->available_quantity)->toBe(0);
    });
});
