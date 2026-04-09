<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApproveRejectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'remarks' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->routeIs('*.approve') && ! $this->route('borrowRequest')->isPending()) {
                $validator->errors()->add('borrow_request', 'This request has already been processed.');
            }

            if ($this->routeIs('*.reject')) {
                $validator->sometimes('remarks', 'required', function () {
                    return true;
                });
            }
        });
    }

    public function messages(): array
    {
        return [
            'remarks.required' => 'Please provide a reason for rejecting this request.',
            'remarks.max' => 'Remarks cannot exceed 500 characters.',
        ];
    }
}
