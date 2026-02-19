<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
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
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('staff/equipment/index', [
            'equipment' => $equipment,
            'filters'   => $request->only(['search', 'status']),
        ]);
    }

    public function show(Equipment $equipment): Response
    {
        abort_if($equipment->school_id !== app('current_school')->id, 403);

        $equipment->load('category');

        return Inertia::render('staff/equipment/show', [
            'equipment' => $equipment,
        ]);
    }
}