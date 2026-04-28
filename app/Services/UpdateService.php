<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UpdateService
{
    protected string $repo;

    protected ?string $token;

    protected int $cacheTtl;

    protected string $cachePath;

    public function __construct()
    {
        $this->repo = config('services.github.repo', 'lock-josua/Borrowix');
        $this->token = config('services.github.update_token');
        $this->cacheTtl = (int) config('services.github.cache_ttl', 300);
        $this->cachePath = storage_path('app/updates');

        if (! is_dir($this->cachePath)) {
            mkdir($this->cachePath, 0755, true);
        }
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
        $cached = $this->getCached('latest');

        if ($cached !== null) {
            return $cached;
        }

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

            $release = [
                'version' => ltrim($data['tag_name'] ?? '0.0.0', 'v'),
                'tag_name' => $data['tag_name'] ?? '',
                'name' => $data['name'] ?? '',
                'body' => $data['body'] ?? '',
                'published_at' => $data['published_at'] ?? null,
                'html_url' => $data['html_url'] ?? '',
                'prerelease' => $data['prerelease'] ?? false,
            ];

            $this->putCached('latest', $release);

            return $release;
        } catch (\Exception $e) {
            Log::warning('UpdateService: Exception fetching release', [
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Fetch all GitHub releases, cached for $cacheTtl seconds.
     * Returns an empty array on failure.
     */
    public function allReleases(): array
    {
        $cached = $this->getCached('all');

        if ($cached !== null) {
            return $cached;
        }

        try {
            $response = Http::withHeaders($this->buildHeaders())
                ->timeout(8)
                ->get("https://api.github.com/repos/{$this->repo}/releases");

            if ($response->failed()) {
                return [];
            }

            $data = $response->json();
            $releases = array_map(function ($item) {
                return [
                    'version' => ltrim($item['tag_name'] ?? '0.0.0', 'v'),
                    'tag_name' => $item['tag_name'] ?? '',
                    'name' => $item['name'] ?? '',
                    'body' => $item['body'] ?? '',
                    'published_at' => $item['published_at'] ?? null,
                    'html_url' => $item['html_url'] ?? '',
                    'prerelease' => $item['prerelease'] ?? false,
                ];
            }, $data);

            $this->putCached('all', $releases);

            return $releases;
        } catch (\Exception $e) {
            return [];
        }
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
            'all_releases' => $this->allReleases(),
            'checked_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Bust the GitHub release cache and return a fresh status.
     */
    public function forceRefresh(): array
    {
        @unlink("{$this->cachePath}/latest.json");
        @unlink("{$this->cachePath}/all.json");

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

    protected function getCached(string $key): ?array
    {
        $file = "{$this->cachePath}/{$key}.json";

        if (! file_exists($file)) {
            return null;
        }

        if (time() - filemtime($file) > $this->cacheTtl) {
            return null;
        }

        return json_decode(file_get_contents($file), true);
    }

    protected function putCached(string $key, array $data): void
    {
        file_put_contents(
            "{$this->cachePath}/{$key}.json",
            json_encode($data)
        );
    }
}
