<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\School;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered school and admin user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'school_name' => ['required', 'string', 'max:255', 'unique:schools,name'],
            'admin_name' => ['required', 'string', 'max:255'],
            'email' => $this->emailRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        // Create the school
        $school = School::create([
            'name' => $input['school_name'],
            'slug' => Str::slug($input['school_name']),
            'email' => $input['email'], // Use admin email as school contact email
        ]);

        // Create the admin user
        return User::create([
            'name' => $input['admin_name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role' => 'admin',
            'school_id' => $school->id,
        ]);
    }
}
