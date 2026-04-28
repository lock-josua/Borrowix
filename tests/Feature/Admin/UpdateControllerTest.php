<?php

use App\Enums\UserRole;
use App\Models\User;
use App\Services\UpdateService;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\mock;

beforeEach(function () {
    Role::findOrCreate(UserRole::Admin->value);
    Role::findOrCreate(UserRole::Student->value);
});

test('admin updates page can be rendered', function () {
    mock(UpdateService::class)
        ->shouldReceive('status')
        ->once()
        ->andReturn([
            'current_version' => '1.0.0',
            'latest_version' => '1.1.0',
            'has_update' => true,
            'latest_name' => 'v1.1.0',
            'changelog' => 'Bug fixes',
            'published_at' => '2026-04-01T00:00:00Z',
            'release_url' => 'https://github.com/lock-josua/Borrowix/releases/tag/v1.1.0',
            'prerelease' => false,
            'all_releases' => [],
            'checked_at' => now()->toIso8601String(),
        ]);

    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->get('/admin/settings/updates');

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/settings/updates')
        ->has('updateStatus')
        ->where('updateStatus.current_version', '1.0.0')
        ->where('updateStatus.has_update', true)
    );
});

test('admin updates page is forbidden for non-admin users', function () {
    $user = User::factory()->student()->create();

    $response = $this->actingAs($user)->get('/admin/settings/updates');

    $response->assertForbidden();
});

test('admin check for updates returns fresh json status', function () {
    mock(UpdateService::class)
        ->shouldReceive('forceRefresh')
        ->once()
        ->andReturn([
            'current_version' => '1.0.0',
            'latest_version' => '1.1.0',
            'has_update' => true,
            'latest_name' => 'v1.1.0',
            'changelog' => 'Bug fixes',
            'published_at' => '2026-04-01T00:00:00Z',
            'release_url' => 'https://github.com/lock-josua/Borrowix/releases/tag/v1.1.0',
            'prerelease' => false,
            'all_releases' => [],
            'checked_at' => now()->toIso8601String(),
        ]);

    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)
        ->postJson('/admin/settings/updates/check');

    $response->assertOk();
    $response->assertJsonPath('current_version', '1.0.0');
    $response->assertJsonPath('has_update', true);
});

test('admin check for updates is forbidden for non-admin users', function () {
    $user = User::factory()->student()->create();

    $response = $this->actingAs($user)
        ->postJson('/admin/settings/updates/check');

    $response->assertForbidden();
});
