<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Enums\EquipmentStatus;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EquipmentController extends Controller
{
    public function index(Request $request): Response
    {
        $equipment = Equipment::with('category')
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->status, fn ($q) => $q->where('status', EquipmentStatus::from($request->status)))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('staff/equipment/index', [
            'equipment' => $equipment,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(Equipment $equipment): Response
    {
        $equipment->load('category');

        return Inertia::render('staff/equipment/show', [
            'equipment' => $equipment,
        ]);
    }
}
