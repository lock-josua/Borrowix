<?php

namespace Database\Factories;

use App\Enums\BorrowRequestStatus;
use App\Models\Equipment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BorrowRequestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'equipment_id' => Equipment::factory(),
            'purpose' => fake()->sentence(),
            'borrow_date' => now()->addDay(),
            'expected_return_date' => now()->addDays(3),
            'status' => BorrowRequestStatus::Pending,
            'processed_by' => null,
            'remarks' => null,
            'processed_at' => null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BorrowRequestStatus::Approved,
            'processed_by' => User::factory(),
            'processed_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BorrowRequestStatus::Rejected,
            'processed_by' => User::factory(),
            'remarks' => fake()->sentence(),
            'processed_at' => now(),
        ]);
    }

    public function canceled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BorrowRequestStatus::Canceled,
        ]);
    }
}
