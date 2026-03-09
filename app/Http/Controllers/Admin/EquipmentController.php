<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Equipment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EquipmentController extends Controller
{
    public function index(Request $request): Response
    {
        $school = app('current_school');

        $equipment = Equipment::where('school_id', $school->id)
            ->with('category')
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->category, fn ($q) => $q->where('category_id', $request->category))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
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

        $categories = Category::where('school_id', $school->id)->get(['id', 'name']);

        return Inertia::render('admin/equipment/index', [
            'equipment' => $equipment,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status']),
        ]);
    }

    public function create(): Response
    {
        $school = app('current_school');
        $categories = Category::where('school_id', $school->id)->get(['id', 'name']);

        return Inertia::render('admin/equipment/create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $school = app('current_school');

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
            'school_id' => $school->id,
            'available_quantity' => $validated['quantity'],
        ]);

        return redirect()
            ->route('admin.equipment.index')
            ->with('success', 'Equipment added successfully.');
    }

    public function update(Request $request, Equipment $equipment): RedirectResponse
    {
        $this->authorizeSchool($equipment);

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
        $this->authorizeSchool($equipment);

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
        $this->authorizeSchool($equipment);

        $school = app('current_school');
        $categories = Category::where('school_id', $school->id)->get(['id', 'name']);

        $equipment->image = $this->resolveImageUrl($equipment->image);

        return Inertia::render('admin/equipment/edit', [
            'equipment' => $equipment,
            'categories' => $categories,
        ]);
    }

    public function destroy(Equipment $equipment): RedirectResponse
    {
        $this->authorizeSchool($equipment);

        // Delete equipment image if it exists
        if ($equipment->image) {
            $this->deleteImage($equipment->image);
        }

        $equipment->delete();

        return redirect()
            ->route('admin.equipment.index')
            ->with('success', 'Equipment deleted.');
    }

    private function authorizeSchool(Equipment $equipment): void
    {
        abort_if($equipment->school_id !== app('current_school')->id, 403);
    }
}
