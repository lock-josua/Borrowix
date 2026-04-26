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

    /**
     * POST /super-admin/settings/updates/install
     * Fetches the latest tag from GitHub and updates the local codebase.
     */
    public function install(): \Illuminate\Http\RedirectResponse
    {
        $status = $this->updateService->status();

        if (! $status['has_update']) {
            return back()->with('error', 'You are already on the latest version.');
        }

        $tag = 'v' . $status['latest_version'];
        $base = base_path();

        try {
            // Run Git commands to checkout the latest tag
            $output = [];
            $returnVar = 0;
            exec("cd {$base} && git fetch --all --tags 2>&1", $output, $returnVar);
            
            if ($returnVar !== 0) {
                throw new \Exception("Git fetch failed: " . implode("\n", $output));
            }
            
            exec("cd {$base} && git checkout {$tag} 2>&1", $output, $returnVar);

            if ($returnVar !== 0) {
                throw new \Exception("Git checkout failed: " . implode("\n", $output));
            }

            // Sync APP_VERSION in .env
            $envPath = base_path('.env');
            if (file_exists($envPath)) {
                $envContent = file_get_contents($envPath);
                $envContent = preg_replace('/^APP_VERSION=.*$/m', 'APP_VERSION=' . $status['latest_version'], $envContent);
                file_put_contents($envPath, $envContent);
            }

            // Clear cache and migrate
            \Illuminate\Support\Facades\Artisan::call('optimize:clear');
            \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);

            // Clear our cache too
            $this->updateService->forceRefresh();

            return back()->with('success', "System successfully updated to {$tag}.");
        } catch (\Exception $e) {
            return back()->with('error', 'Update failed: ' . $e->getMessage());
        }
    }
}
