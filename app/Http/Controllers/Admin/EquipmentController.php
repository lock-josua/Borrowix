<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Equipment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            ->withQueryString();

        $categories = Category::where('school_id', $school->id)->get(['id', 'name']);

        return Inertia::render('admin/equipment/index', [
            'equipment'  => $equipment,
            'categories' => $categories,
            'filters'    => $request->only(['search', 'category', 'status']),
        ]);
    }

    public function create(): Response
    {
        $school     = app('current_school');
        $categories = Category::where('school_id', $school->id)->get(['id', 'name']);

        return Inertia::render('admin/equipment/create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $school = app('current_school');

        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'category_id'   => ['nullable', 'exists:categories,id'],
            'description'   => ['nullable', 'string'],
            'brand'         => ['nullable', 'string', 'max:100'],
            'model'         => ['nullable', 'string', 'max:100'],
            'serial_number' => ['nullable', 'string', 'max:100'],
            'quantity'      => ['required', 'integer', 'min:1'],
            'status'        => ['required', 'in:available,under_repair,retired'],
        ]);

        Equipment::create([
            ...$validated,
            'school_id'          => $school->id,
            'available_quantity' => $validated['quantity'],
        ]);

        return redirect()
            ->route('admin.equipment.index')
            ->with('success', 'Equipment added successfully.');
    }

    public function show(Equipment $equipment): Response
    {
        $this->authorizeSchool($equipment);

        $equipment->load('category');
        $equipment->loadCount('borrowTransactions');

        return Inertia::render('admin/equipment/show', [
            'equipment' => $equipment,
        ]);
    }

    public function edit(Equipment $equipment): Response
    {
        $this->authorizeSchool($equipment);

        $school     = app('current_school');
        $categories = Category::where('school_id', $school->id)->get(['id', 'name']);

        return Inertia::render('admin/equipment/edit', [
            'equipment'  => $equipment,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Equipment $equipment): RedirectResponse
    {
        $this->authorizeSchool($equipment);

        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'category_id'   => ['nullable', 'exists:categories,id'],
            'description'   => ['nullable', 'string'],
            'brand'         => ['nullable', 'string', 'max:100'],
            'model'         => ['nullable', 'string', 'max:100'],
            'serial_number' => ['nullable', 'string', 'max:100'],
            'quantity'      => ['required', 'integer', 'min:1'],
            'status'        => ['required', 'in:available,under_repair,retired'],
        ]);

        $equipment->update($validated);

        return redirect()
            ->route('admin.equipment.index')
            ->with('success', 'Equipment updated successfully.');
    }

    public function destroy(Equipment $equipment): RedirectResponse
    {
        $this->authorizeSchool($equipment);

        $equipment->delete();

        return redirect()
            ->route('admin.equipment.index')
            ->with('success', 'Equipment deleted.');
    }

    private function authorizeSchool(Equipment $equipment): void
    {
        abort_if($equipment->school_id !== app('current_school')->id, 403, 'Unauthorized.');
    }
}