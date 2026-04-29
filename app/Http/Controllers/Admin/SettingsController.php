<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Cloudinary\Cloudinary;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): RedirectResponse
    {
        return redirect()->route('admin.settings.general');
    }

    public function general(): Response
    {
        $tenant = tenant();

        return Inertia::render('admin/settings/general', [
            'general' => [
                'name' => $tenant->school_name ?? '',
                'email' => $tenant->school_email ?? '',
                'contact_number' => $tenant->contact_number ?? '',
                'address' => $tenant->address ?? '',
                'academic_year' => $tenant->academic_year ?? '',
                'default_borrow_days' => $tenant->default_borrow_days ?? 7,
                'timezone' => $tenant->timezone ?? 'Asia/Manila',
            ],
        ]);
    }

    public function updateGeneral(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'academic_year' => ['nullable', 'string', 'max:20'],
            'default_borrow_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'timezone' => ['nullable', 'string', 'max:100'],
        ]);

        tenant()->update([
            'school_name' => $validated['name'],
            'school_email' => $validated['email'],
            'contact_number' => $validated['contact_number'],
            'address' => $validated['address'],
            'academic_year' => $validated['academic_year'],
            'default_borrow_days' => $validated['default_borrow_days'] ?? 7,
            'timezone' => $validated['timezone'] ?? 'Asia/Manila',
        ]);

        return redirect()
            ->route('admin.settings.general')
            ->with('success', 'General settings updated.');
    }

    public function school(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('admin/settings/school', [
            'admin' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function updateSchool(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255',
                'unique:users,email,'.$request->user()->id],
        ]);

        $user = $request->user();
        $user->fill($validated);
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        $user->save();

        return redirect()->route('admin.settings.school')
            ->with('success', 'Profile updated.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('admin.settings.school')
            ->with('success', 'Password changed successfully.');
    }

    /**
     * Upload an image to Cloudinary storage.
     */
    protected function uploadImage($file): string
    {
        $folder = 'tenants/'.tenant()->id;
        $publicId = Str::uuid()->toString(); // Clean, unique ID
        $cloudinary = app(Cloudinary::class);
        $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
            'folder' => $folder,
            'public_id' => $publicId,
        ]);

        // Return the full secure URL
        return $result['secure_url'];
    }

    /**
     * Resolve the image value to a full URL for the frontend.
     */
    protected function resolveImageUrl($image): ?string
    {
        if (! $image) {
            return null;
        }

        // Already a full URL - return as-is (this is the secure_url from Cloudinary)
        if (str_starts_with($image, 'http')) {
            return $image;
        }

        // Already a /storage/... URL (legacy records)
        if (str_starts_with($image, '/storage/')) {
            return $image;
        }

        // Fallback to Storage::url
        return Storage::url($image);
    }

    public function customization(): Response
    {
        $tenant = tenant();

        return Inertia::render('admin/settings/customization', [
            'customization' => [
                'logo_url' => $tenant->logo_path
                                                ? $this->resolveImageUrl($tenant->logo_path) : null,
                'login_bg_mode' => $tenant->login_bg_mode ?? 'color',
                'login_bg_color' => $tenant->login_bg_color ?? '#04305d',
                'login_bg_image_url' => $tenant->login_bg_image
                                                ? $this->resolveImageUrl($tenant->login_bg_image) : null,
                'primary_color' => $tenant->primary_color ?? '#EA580C',
                'active_theme' => $tenant->active_theme ?? 'default',
                'school_tagline' => $tenant->school_tagline ?? '',
                'public_browse_enabled' => (bool) ($tenant->public_browse_enabled ?? false),
                'maintenance_message' => $tenant->maintenance_message ?? '',
            ],
            'available_themes' => \App\Services\TenantThemeService::themesForFrontend(),
        ]);
    }

    public function updateCustomization(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'logo' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'login_bg_image' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'login_bg_mode' => ['nullable', 'string', 'in:color,image'],
            'login_bg_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'primary_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'active_theme' => ['nullable', 'string', 'in:'.implode(',', \App\Services\TenantThemeService::validSlugs())],
            'school_tagline' => ['nullable', 'string', 'max:150'],
            'public_browse_enabled' => ['nullable', 'boolean'],
            'maintenance_message' => ['nullable', 'string', 'max:500'],
        ]);

        $updates = [];

        if ($request->hasFile('logo')) {
            $updates['logo_path'] = $this->uploadImage($request->file('logo'));
        }

        if ($request->hasFile('login_bg_image')) {
            $updates['login_bg_image'] = $this->uploadImage($request->file('login_bg_image'));
        }

        $scalar = [
            'login_bg_mode', 'login_bg_color', 'primary_color', 'active_theme',
            'school_tagline', 'public_browse_enabled', 'maintenance_message',
        ];

        foreach ($scalar as $key) {
            if (array_key_exists($key, $validated)) {
                $updates[$key] = $validated[$key];
            }
        }

        if (isset($updates['active_theme'])) {
            $updates['primary_color'] = \App\Services\TenantThemeService::swatchHex($updates['active_theme']);
        }

        tenant()->update($updates);

        return redirect()->route('admin.settings.customization')
            ->with('success', 'Customization saved.');
    }
}
