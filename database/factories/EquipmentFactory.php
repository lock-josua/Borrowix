<?php

namespace Database\Factories;

use App\Enums\EquipmentStatus;
use App\Models\Equipment;
use Illuminate\Database\Eloquent\Factories\Factory;

class EquipmentFactory extends Factory
{
    protected $model = Equipment::class;

    public function definition(): array
    {
        return [
            'category_id' => CategoryFactory::new(),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'serial_number' => fake()->unique()->isbn10(),
            'model' => fake()->word().'-'.fake()->randomNumber(4),
            'brand' => fake()->company(),
            'quantity' => fake()->numberBetween(1, 20),
            'available_quantity' => fake()->numberBetween(0, 20),
            'status' => EquipmentStatus::Available,
            'condition_notes' => null,
            'damage_photo' => null,
            'image' => null,
        ];
    }

    public function borrowed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => EquipmentStatus::Borrowed,
            'available_quantity' => 0,
        ]);
    }
}
