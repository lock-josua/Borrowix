<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Services\UpdateService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class UpdateController extends Controller
{
    public function __construct(protected UpdateService $updateService) {}

    /**
     * GET /super-admin/settings/updates
     * Renders the Updates tab in SuperAdmin settings.
     */
    public function index(): Response
    {
        return Inertia::render('super-admin/settings/updates', [
            'updateStatus' => $this->updateService->status(),
        ]);
    }

    /**
     * POST /super-admin/settings/updates/check
     * Clears the cache and returns a fresh JSON status (AJAX).
     */
    public function check(): JsonResponse
    {
        return response()->json(
            $this->updateService->forceRefresh()
        );
    }
}
