<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UpdateService
{
    protected string $repo;

    protected ?string $token;

    protected int $cacheTtl = 300; // 5 minutes

    public function __construct()
    {
        $this->repo = config('services.github.repo', 'lock-josua/Borrowix');
        $this->token = config('services.github.update_token');
    }

    /**
     * The currently running version (from APP_VERSION env).
     */
    public function currentVersion(): string
    {
        return config('app.version', '1.0.0');
    }

    /**
     * Fetch latest GitHub release, cached for $cacheTtl seconds.
     * Returns null if the API call fails.
     */
    public function latestRelease(): ?array
    {
        return Cache::remember('github_latest_release', $this->cacheTtl, function () {
            try {
                $response = Http::withHeaders($this->buildHeaders())
                    ->timeout(8)
                    ->get("https://api.github.com/repos/{$this->repo}/releases/latest");

                if ($response->failed()) {
                    Log::warning('UpdateService: GitHub API returned non-2xx', [
                        'status' => $response->status(),
                        'repo' => $this->repo,
                    ]);

                    return null;
                }

                $data = $response->json();

                return [
                    'version' => ltrim($data['tag_name'] ?? '0.0.0', 'v'),
                    'tag_name' => $data['tag_name'] ?? '',
                    'name' => $data['name'] ?? '',
                    'body' => $data['body'] ?? '',
                    'published_at' => $data['published_at'] ?? null,
                    'html_url' => $data['html_url'] ?? '',
                    'prerelease' => $data['prerelease'] ?? false,
                ];
            } catch (\Exception $e) {
                Log::warning('UpdateService: Exception fetching release', [
                    'error' => $e->getMessage(),
                ]);

                return null;
            }
        });
    }

    /**
     * True when a newer version is available on GitHub.
     */
    public function hasUpdate(): bool
    {
        $latest = $this->latestRelease();

        return $latest && version_compare($latest['version'], $this->currentVersion(), '>');
    }

    /**
     * Structured status array ready for the frontend.
     */
    public function status(): array
    {
        $latest = $this->latestRelease();
        $current = $this->currentVersion();

        return [
            'current_version' => $current,
            'latest_version' => $latest['version'] ?? null,
            'has_update' => $latest ? version_compare($latest['version'], $current, '>') : false,
            'latest_name' => $latest['name'] ?? null,
            'changelog' => $latest['body'] ?? null,
            'published_at' => $latest['published_at'] ?? null,
            'release_url' => $latest['html_url'] ?? null,
            'prerelease' => $latest['prerelease'] ?? false,
            'checked_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Bust the cache and return a fresh status.
     * Only SuperAdmin should call this.
     */
    public function forceRefresh(): array
    {
        Cache::forget('github_latest_release');

        return $this->status();
    }

    protected function buildHeaders(): array
    {
        $headers = [
            'Accept' => 'application/vnd.github+json',
            'X-GitHub-Api-Version' => '2022-11-28',
            'User-Agent' => 'Borrowix/'.$this->currentVersion(),
        ];

        if ($this->token) {
            $headers['Authorization'] = "Bearer {$this->token}";
        }

        return $headers;
    }
}
