<?php

namespace App\Http\Requests;

use App\Enums\BorrowRequestStatus;
use App\Enums\BorrowTransactionStatus;
use App\Models\Equipment;
use Illuminate\Foundation\Http\FormRequest;

class StoreBorrowRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $equipmentId = $this->input('equipment_id');

        return [
            'equipment_id' => [
                'required',
                'exists:equipment,id',
                function ($attribute, $value, $fail) use ($equipmentId) {
                    if (! $equipmentId) {
                        return;
                    }

                    $equipment = Equipment::find($equipmentId);
                    if ($equipment && ! $equipment->isAvailable()) {
                        $fail('This equipment is not available for borrowing.');
                    }
                },
                function ($attribute, $value, $fail) {
                    $hasActiveTransaction = \App\Models\BorrowTransaction::where('borrower_id', $this->user()->id)
                        ->where('equipment_id', $value)
                        ->where('status', BorrowTransactionStatus::Active)
                        ->exists();

                    if ($hasActiveTransaction) {
                        $fail('You already have an active transaction for this equipment.');
                    }

                    $hasPendingRequest = \App\Models\BorrowRequest::where('user_id', $this->user()->id)
                        ->where('equipment_id', $value)
                        ->where('status', BorrowRequestStatus::Pending)
                        ->exists();

                    if ($hasPendingRequest) {
                        $fail('You already have a pending request for this equipment.');
                    }
                },
            ],
            'purpose' => ['required', 'string', 'max:500'],
            'borrow_date' => ['required', 'date', 'after_or_equal:now'],
            'expected_return_date' => ['required', 'date', 'after:borrow_date', 'before_or_equal:+30 days'],
        ];
    }

    public function messages(): array
    {
        return [
            'expected_return_date.before_or_equal' => 'The return date must be within 30 days from the borrow date.',
        ];
    }
}
