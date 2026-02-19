<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PromoCodeController extends Controller
{
    public function index(): Response
    {
        $promoCodes = PromoCode::latest()->paginate(15);

        return Inertia::render('super-admin/promo-codes/index', [
            'promoCodes' => $promoCodes,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('super-admin/promo-codes/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code'             => ['required', 'string', 'unique:promo_codes,code', 'max:50'],
            'description'      => ['nullable', 'string', 'max:255'],
            'discount_type'    => ['required', 'in:percentage,fixed'],
            'discount_value'   => ['required', 'numeric', 'min:1'],
            'applicable_plan'  => ['nullable', 'in:free,basic,pro'],
            'max_uses'         => ['nullable', 'integer', 'min:1'],
            'expires_at'       => ['nullable', 'date', 'after:today'],
        ]);

        PromoCode::create($validated);

        return redirect()
            ->route('super-admin.promo-codes.index')
            ->with('success', 'Promo code created successfully.');
    }

    public function edit(PromoCode $promoCode): Response
    {
        return Inertia::render('super-admin/promo-codes/edit', [
            'promoCode' => $promoCode,
        ]);
    }

    public function update(Request $request, PromoCode $promoCode): RedirectResponse
    {
        $validated = $request->validate([
            'description'     => ['nullable', 'string', 'max:255'],
            'discount_type'   => ['required', 'in:percentage,fixed'],
            'discount_value'  => ['required', 'numeric', 'min:1'],
            'applicable_plan' => ['nullable', 'in:free,basic,pro'],
            'max_uses'        => ['nullable', 'integer', 'min:1'],
            'is_active'       => ['required', 'boolean'],
            'expires_at'      => ['nullable', 'date'],
        ]);

        $promoCode->update($validated);

        return redirect()
            ->route('super-admin.promo-codes.index')
            ->with('success', 'Promo code updated successfully.');
    }

    public function destroy(PromoCode $promoCode): RedirectResponse
    {
        $promoCode->delete();

        return redirect()
            ->route('super-admin.promo-codes.index')
            ->with('success', 'Promo code deleted.');
    }
}