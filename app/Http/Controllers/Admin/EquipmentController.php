<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EquipmentStatus;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Equipment;
use App\Services\QrCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EquipmentController extends Controller
{
    public function index(Request $request): Response
    {
        $equipment = Equipment::with('category')
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->category, fn ($q) => $q->where('category_id', $request->category))
            ->when($request->status, fn ($q) => $q->where('status', EquipmentStatus::from($request->status)))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(function ($equipment) {
                return [
                    'id' => $equipment->id,
                    'name' => $equipment->name,
                    'brand' => $equipment->brand,
                    'model' => $equipment->model,
                    'quantity' => $equipment->quantity,
                    'available_quantity' => $equipment->available_quantity,
                    'status' => $equipment->status,
                    'category' => $equipment->category,
                    'image' => $this->resolveImageUrl($equipment->image),
                ];
            });

        $categories = Category::get(['id', 'name']);

        return Inertia::render('admin/equipment/index', [
            'equipment' => $equipment,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status']),
        ]);
    }

    public function create(): Response
    {
        $categories = Category::get(['id', 'name']);

        return Inertia::render('admin/equipment/create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize(Permission::EquipmentCreate->value);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'description' => ['nullable', 'string'],
            'brand' => ['nullable', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'serial_number' => ['nullable', 'string', 'max:100'],
            'quantity' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:available,under_repair,retired'],
            'image' => ['nullable', 'image', 'max:2048'], // 2MB limit
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->uploadImage($request->file('image'));
        }

        $equipment = Equipment::create([
            ...$validated,
            'available_quantity' => $validated['quantity'],
        ]);

        return redirect()
            ->route('admin.equipment.index')
            ->with('success', 'Equipment added successfully.');
    }

    public function update(Request $request, Equipment $equipment): RedirectResponse
    {
        $this->authorize(Permission::EquipmentUpdate->value);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'description' => ['nullable', 'string'],
            'brand' => ['nullable', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'serial_number' => ['nullable', 'string', 'max:100'],
            'quantity' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:available,under_repair,retired'],
            'image' => ['nullable', 'image', 'max:2048'], // 2MB limit
            'remove_image' => ['nullable', 'boolean'],
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($equipment->image) {
                $this->deleteImage($equipment->image);
            }
            $validated['image'] = $this->uploadImage($request->file('image'));
        }

        // Handle image removal (only when explicitly set to true)
        if (isset($validated['remove_image']) && $validated['remove_image'] && $equipment->image) {
            $this->deleteImage($equipment->image);
            $validated['image'] = null;
        }

        $equipment->update($validated);

        return redirect()
            ->route('admin.equipment.index')
            ->with('success', 'Equipment updated successfully.');
    }

    /**
     * Upload an image to storage.
     */
    protected function uploadImage(\Illuminate\Http\UploadedFile $file): string
    {
        $disk = config('filesystems.default');

        if ($disk === 'cloudinary') {
            // Upload to Cloudinary
            $result = $file->store('', 'cloudinary');

            return $result;
        } else {
            // Upload to local storage (public disk) — store the raw path, not the URL
            return $file->store('equipment/images', 'public');
        }
    }

    /**
     * Resolve the image value to a full URL for the frontend.
     */
    protected function resolveImageUrl(?string $image): ?string
    {
        if (! $image) {
            return null;
        }

        // Already a full URL (Cloudinary or external)
        if (str_starts_with($image, 'http')) {
            return $image;
        }

        // Already a /storage/... URL (legacy records)
        if (str_starts_with($image, '/storage/')) {
            return $image;
        }

        // Raw storage path — convert to URL
        return Storage::url($image);
    }

    /**
     * Delete an image from storage.
     */
    protected function deleteImage(string $imagePath): void
    {
        $disk = config('filesystems.default');

        if ($disk === 'cloudinary') {
            // Delete from Cloudinary
            try {
                \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::destroy($imagePath);
            } catch (\Exception $e) {
                // Ignore errors when deleting from Cloudinary
            }
        } else {
            // Delete from local storage
            if (Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
        }
    }

    public function show(Equipment $equipment): Response
    {

        $freshEquipment = Equipment::with('category')
            ->withCount('borrowTransactions')
            ->find($equipment->id);

        $freshEquipment->image = $this->resolveImageUrl($freshEquipment->image);

        return Inertia::render('admin/equipment/show', [
            'equipment' => $freshEquipment,
        ]);
    }

    public function edit(Equipment $equipment): Response
    {
        $categories = Category::get(['id', 'name']);

        $equipment->image = $this->resolveImageUrl($equipment->image);

        return Inertia::render('admin/equipment/edit', [
            'equipment' => $equipment,
            'categories' => $categories,
        ]);
    }

    public function destroy(Equipment $equipment): RedirectResponse
    {
        $this->authorize(Permission::EquipmentDelete->value);

        // Delete equipment image if it exists
        if ($equipment->image) {
            $this->deleteImage($equipment->image);
        }

        $equipment->delete();

        return redirect()
            ->route('admin.equipment.index')
            ->with('success', 'Equipment deleted.');
    }

    public function generateQrCode(Equipment $equipment): RedirectResponse
    {
        $this->authorize(Permission::EquipmentQrGenerate->value);

        app(QrCodeService::class)->generateTokenForEquipment($equipment);

        return back()->with('success', 'QR code generated successfully.');
    }

    public function showQrCode(Equipment $equipment): JsonResponse
    {
        $this->authorize(Permission::EquipmentQrGenerate->value);

        return response()->json([
            'qr_token' => $equipment->qr_code,
        ]);
    }
}
