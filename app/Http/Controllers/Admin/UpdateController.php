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

    /**
     * POST /admin/settings/updates/install
     * Fetches the latest tag from GitHub and updates the local codebase.
     */
    public function install(): \Illuminate\Http\RedirectResponse
    {
        $status = $this->updateService->status();

        if (! $status['has_update']) {
            return back()->with('error', 'You are already on the latest version.');
        }

        $latestVersion = $status['latest_version'];

        // Validate version format before passing to shell
        if (! preg_match('/^\d+\.\d+\.\d+(-[\w.]+)?$/', $latestVersion)) {
            return back()->with('error', 'Invalid version format detected.');
        }

        $tag = 'v'.$latestVersion;
        $base = base_path();

        try {
            // Fetch all tags from remote
            $output = [];
            $returnVar = 0;
            exec('git -C '.escapeshellarg($base).' fetch --all --tags 2>&1', $output, $returnVar);

            if ($returnVar !== 0) {
                throw new \Exception('Git fetch failed: '.implode("\n", $output));
            }

            // Checkout the target tag
            $output = [];
            exec('git -C '.escapeshellarg($base).' checkout '.escapeshellarg($tag).' 2>&1', $output, $returnVar);

            if ($returnVar !== 0) {
                throw new \Exception('Git checkout failed: '.implode("\n", $output));
            }

            // Sync APP_VERSION in .env
            $envPath = base_path('.env');
            if (file_exists($envPath)) {
                $envContent = file_get_contents($envPath);
                $envContent = preg_replace('/^APP_VERSION=.*$/m', 'APP_VERSION='.$latestVersion, $envContent);
                file_put_contents($envPath, $envContent);
            }

            // Update runtime config so currentVersion() returns the new value
            config(['app.version' => $latestVersion]);

            // Clear cache and migrate
            \Illuminate\Support\Facades\Artisan::call('optimize:clear');
            \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);

            // Clear our GitHub cache too
            $this->updateService->forceRefresh();

            return back()->with('success', "System successfully updated to {$tag}.");
        } catch (\Exception $e) {
            return back()->with('error', 'Update failed: '.$e->getMessage());
        }
    }
}
