<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFeedbackRequest;
use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function index(Request $request)
    {
        $feedbacks = Feedback::where('user_email', $request->user()->email)
            ->latest()
            ->get();

        return response()->json($feedbacks);
    }

    public function store(StoreFeedbackRequest $request): RedirectResponse
    {
        $tenantId = tenant('id');

        Feedback::create([
            'tenant_id' => $tenantId,
            'user_name' => $request->user()->name,
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role->value ?? 'student',
            'type' => $request->validated('type'),
            'title' => $request->validated('title'),
            'description' => $request->validated('description'),
        ]);

        return back()->with('success', 'Thank you for your feedback! It has been submitted successfully.');
    }
}
