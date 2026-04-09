<?php

namespace Database\Factories;

use App\Enums\BorrowTransactionStatus;
use App\Models\BorrowRequest;
use App\Models\Equipment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BorrowTransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'borrow_request_id' => BorrowRequest::factory(),
            'borrower_id' => User::factory(),
            'equipment_id' => Equipment::factory(),
            'issued_by' => User::factory(),
            'returned_to' => null,
            'issued_at' => now(),
            'due_date' => now()->addDays(3),
            'returned_at' => null,
            'status' => BorrowTransactionStatus::Active,
            'fine_amount' => 0,
            'fine_reason' => null,
            'return_condition_notes' => null,
        ];
    }

    public function returned(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BorrowTransactionStatus::Returned,
            'returned_at' => now(),
            'returned_to' => User::factory(),
            'return_condition_notes' => 'Good condition',
        ]);
    }

    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BorrowTransactionStatus::Overdue,
            'due_date' => now()->subDay(),
        ]);
    }

    public function withFine(float $amount = 50.00, string $reason = 'Damaged'): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BorrowTransactionStatus::Returned,
            'returned_at' => now(),
            'returned_to' => User::factory(),
            'fine_amount' => $amount,
            'fine_reason' => $reason,
        ]);
    }
}
