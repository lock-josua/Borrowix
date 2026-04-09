<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id ?? $this->user()?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users')->ignore($userId)],
            'role' => ['required', Rule::in(['student', 'staff'])],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The full name is required.',
            'name.max' => 'The full name cannot exceed 255 characters.',
            'email.required' => 'The email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email address is already in use.',
            'role.required' => 'Please select a role.',
            'role.in' => 'Please select a valid role (Student or Staff).',
        ];
    }
}
