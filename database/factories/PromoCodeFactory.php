<?php

namespace Database\Factories;

use App\Models\PromoCode;
use Illuminate\Database\Eloquent\Factories\Factory;

class PromoCodeFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = PromoCode::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $discountTypes = ['percentage', 'fixed'];
        $plans = ['free', 'basic', 'pro'];
        
        return [
            'code' => $this->faker->unique()->lexify('??????'),
            'description' => $this->faker->sentence,
            'discount_type' => $this->faker->randomElement($discountTypes),
            'discount_value' => $this->faker->randomFloat(2, 1, 100),
            'applicable_plan' => $this->faker->randomElement([null, ...$plans]),
            'max_uses' => $this->faker->optional()->numberBetween(1, 100),
            'times_used' => 0,
            'is_active' => $this->faker->boolean,
            'expires_at' => $this->faker->optional()->dateTimeBetween('now', '+1 year'),
        ];
    }
}
