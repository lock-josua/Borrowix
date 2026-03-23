<?php

namespace App\Http\Controllers\Student;

use App\Enums\EquipmentStatus;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrowseController extends Controller
{
    public function index(Request $request): Response
    {
        $equipment = Equipment::with('category')
            ->where('status', EquipmentStatus::Available)
            ->where('available_quantity', '>', 0)
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('brand', 'like', "%{$request->search}%")
                ->orWhere('model', 'like', "%{$request->search}%")
            )
            ->when($request->category, fn ($q) => $q->where('category_id', $request->category)
            )
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn ($e) => [
                'id' => $e->id,
                'name' => $e->name,
                'brand' => $e->brand,
                'model' => $e->model,
                'description' => $e->description,
                'available_quantity' => $e->available_quantity,
                'quantity' => $e->quantity,
                'image_url' => $e->image_url,
                'category' => $e->category?->only(['id', 'name']),
            ]);

        $categories = Category::select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('student/browse', [
            'equipment' => $equipment,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
        ]);
    }
}
