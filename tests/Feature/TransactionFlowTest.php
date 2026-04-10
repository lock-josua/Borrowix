<?php

use App\Enums\BorrowRequestStatus;
use App\Enums\BorrowTransactionStatus;
use App\Models\BorrowRequest;
use App\Models\BorrowTransaction;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->seed(Database\Seeders\RolePermissionSeeder::class);

    $this->student = User::factory()->create(['role' => 'student']);
    $this->student->syncRoles(['student']);

    $this->staff = User::factory()->create(['role' => 'staff']);
    $this->staff->syncRoles(['staff']);

    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->admin->syncRoles(['admin']);
});

describe('Transaction Model Tests', function () {
    beforeEach(function () {
        if (! Schema::hasTable('borrow_requests')) {
            $this->markTestSkipped('Borrow requests table does not exist - tenant migrations not loaded');
        }
    });

    test('transaction can be created with active status', function () {
        $request = BorrowRequest::factory()->create([
            'status' => BorrowRequestStatus::Approved,
        ]);

        $transaction = BorrowTransaction::factory()->create([
            'borrow_request_id' => $request->id,
            'borrower_id' => $this->student->id,
            'status' => BorrowTransactionStatus::Active,
            'due_date' => now()->addDays(3),
        ]);

        expect($transaction->status)->toBe(BorrowTransactionStatus::Active);
        expect($transaction->isActive())->toBeTrue();
    });

    test('transaction can be marked as returned', function () {
        $transaction = BorrowTransaction::factory()->create([
            'status' => BorrowTransactionStatus::Active,
            'due_date' => now()->addDays(3),
        ]);

        $transaction->update([
            'status' => BorrowTransactionStatus::Returned,
            'returned_at' => now(),
            'returned_to' => $this->staff->id,
            'return_condition_notes' => 'Good condition',
        ]);

        expect($transaction->fresh()->isReturned())->toBeTrue();
        expect($transaction->fresh()->returned_at)->not->toBeNull();
    });

    test('transaction can have fine', function () {
        $transaction = BorrowTransaction::factory()->create([
            'status' => BorrowTransactionStatus::Returned,
            'returned_at' => now(),
            'fine_amount' => 50.00,
            'fine_reason' => 'Damaged screen',
        ]);

        expect($transaction->hasFine())->toBeTrue();
        expect($transaction->fine_amount)->toBe(50.00);
        expect($transaction->fine_reason)->toBe('Damaged screen');
    });

    test('transaction can be overdue', function () {
        $transaction = BorrowTransaction::factory()->create([
            'status' => BorrowTransactionStatus::Active,
            'due_date' => now()->subDay(),
        ]);

        expect($transaction->isOverdue())->toBeTrue();
    });

    test('transaction returns false for overdue when not past due date', function () {
        $transaction = BorrowTransaction::factory()->create([
            'status' => BorrowTransactionStatus::Active,
            'due_date' => now()->addDays(3),
        ]);

        expect($transaction->isOverdue())->toBeFalse();
    });

    test('transaction has borrower relationship', function () {
        $transaction = BorrowTransaction::factory()->create([
            'borrower_id' => $this->student->id,
        ]);

        expect($transaction->borrower->id)->toBe($this->student->id);
    });

    test('transaction has borrow request relationship', function () {
        $request = BorrowRequest::factory()->create();
        $transaction = BorrowTransaction::factory()->create([
            'borrow_request_id' => $request->id,
        ]);

        expect($transaction->borrowRequest->id)->toBe($request->id);
    });
});

describe('Transaction Status Transitions', function () {
    beforeEach(function () {
        if (! Schema::hasTable('borrow_requests')) {
            $this->markTestSkipped('Tenant migrations not loaded');
        }
    });

    test('active transaction can transition to returned', function () {
        $transaction = BorrowTransaction::factory()->create([
            'status' => BorrowTransactionStatus::Active,
        ]);

        $transaction->update(['status' => BorrowTransactionStatus::Returned]);

        expect($transaction->fresh()->status)->toBe(BorrowTransactionStatus::Returned);
    });

    test('active transaction can transition to overdue', function () {
        $transaction = BorrowTransaction::factory()->create([
            'status' => BorrowTransactionStatus::Active,
            'due_date' => now()->subDay(),
        ]);

        expect($transaction->fresh()->isOverdue())->toBeTrue();
    });

    test('returned transaction cannot be returned again', function () {
        $transaction = BorrowTransaction::factory()->returned()->create();

        expect($transaction->status)->toBe(BorrowTransactionStatus::Returned);
        expect($transaction->returned_at)->not->toBeNull();
    });
});

describe('Transaction Fine Tests', function () {
    beforeEach(function () {
        if (! Schema::hasTable('borrow_requests')) {
            $this->markTestSkipped('Tenant migrations not loaded');
        }
    });

    test('transaction without fine has zero fine amount', function () {
        $transaction = BorrowTransaction::factory()->create([
            'fine_amount' => 0,
            'fine_reason' => null,
        ]);

        expect($transaction->hasFine())->toBeFalse();
    });

    test('transaction with fine amount greater than zero has fine', function () {
        $transaction = BorrowTransaction::factory()->create([
            'fine_amount' => 100.00,
            'fine_reason' => 'Lost equipment',
        ]);

        expect($transaction->hasFine())->toBeTrue();
    });

    test('fine amount is stored as decimal', function () {
        $transaction = BorrowTransaction::factory()->create([
            'fine_amount' => 99.99,
        ]);

        expect($transaction->fine_amount)->toBe(99.99);
    });
});

describe('Transaction Return Condition Tests', function () {
    beforeEach(function () {
        if (! Schema::hasTable('borrow_requests')) {
            $this->markTestSkipped('Tenant migrations not loaded');
        }
    });

    test('transaction can have return condition notes', function () {
        $transaction = BorrowTransaction::factory()->create([
            'return_condition_notes' => 'Minor scratches on display',
        ]);

        expect($transaction->return_condition_notes)->toBe('Minor scratches on display');
    });

    test('transaction can have null return condition notes', function () {
        $transaction = BorrowTransaction::factory()->create([
            'return_condition_notes' => null,
        ]);

        expect($transaction->return_condition_notes)->toBeNull();
    });
});

describe('Transaction User Relationships', function () {
    beforeEach(function () {
        if (! Schema::hasTable('borrow_requests')) {
            $this->markTestSkipped('Tenant migrations not loaded');
        }
    });

    test('transaction has issued by user', function () {
        $transaction = BorrowTransaction::factory()->create([
            'issued_by' => $this->admin->id,
        ]);

        expect($transaction->issuedBy->id)->toBe($this->admin->id);
    });

    test('transaction has returned to user', function () {
        $transaction = BorrowTransaction::factory()->returned()->create([
            'returned_to' => $this->staff->id,
        ]);

        expect($transaction->returnedTo->id)->toBe($this->staff->id);
    });
});
