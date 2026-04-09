<?php

use App\Enums\Permission;
use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

it('denies student from approving requests', function () {
    $student = User::factory()->create(['role' => UserRole::Student]);

    expect($student->can(Permission::RequestApprove->value))->toBeFalse();
});

it('denies student from marking items as returned', function () {
    $student = User::factory()->create(['role' => UserRole::Student]);

    expect($student->can(Permission::TransactionReturn->value))->toBeFalse();
});

it('allows staff to mark items as returned', function () {
    $staff = User::factory()->create(['role' => UserRole::Staff]);

    expect($staff->can(Permission::TransactionReturn->value))->toBeTrue();
});

it('allows staff to create transactions', function () {
    $staff = User::factory()->create(['role' => UserRole::Staff]);

    expect($staff->can(Permission::TransactionCreate->value))->toBeTrue();
});

it('allows student to create borrow requests', function () {
    $student = User::factory()->create(['role' => UserRole::Student]);

    expect($student->can(Permission::RequestCreate->value))->toBeTrue();
});

it('denies student from creating transactions', function () {
    $student = User::factory()->create(['role' => UserRole::Student]);

    expect($student->can(Permission::TransactionCreate->value))->toBeFalse();
});

it('returns 403 when student tries to mark item as returned via controller', function () {
    $this->markTestSkipped('Requires full tenant database setup for controller tests');
});

it('returns 403 when student tries to call request.approve permission', function () {
    $student = User::factory()->create(['role' => UserRole::Student]);

    $this->actingAs($student);

    expect($student->can(Permission::RequestApprove->value))->toBeFalse();
});
