<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\UpdateService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class UpdateController extends Controller
{
    public function __construct(protected UpdateService $updateService) {}

    /**
     * GET /admin/settings/updates
     * Renders the Updates tab in Admin settings.
     */
    public function index(): Response
    {
        return Inertia::render('admin/settings/updates', [
            'updateStatus' => $this->updateService->status(),
        ]);
    }

    /**
     * POST /admin/settings/updates/check
     * Clears the cache and returns a fresh JSON status.
     */
    public function check(): JsonResponse
    {
        return response()->json(
            $this->updateService->forceRefresh()
        );
    }
}
