<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    public function index(Request $request): Response
    {
        $feedbacks = Feedback::latest()->paginate(15);

        return Inertia::render('super-admin/feedbacks/index', [
            'feedbacks' => $feedbacks,
        ]);
    }

    public function update(Request $request, Feedback $feedback)
    {
        $validated = $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed',
            'admin_response' => 'nullable|string',
        ]);

        if ($request->filled('admin_response') && $feedback->admin_response !== $request->admin_response) {
            $validated['responded_at'] = now();
        }

        $feedback->update($validated);

        return back()->with('success', 'Feedback updated successfully.');
    }
}
