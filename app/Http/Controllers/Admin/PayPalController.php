<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Services\PayPalService;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PayPalController extends Controller
{
    public function __construct(
        private readonly PayPalService $paypal,
        private readonly SubscriptionService $subscriptionService,
    ) {}

    /**
     * Initiate a PayPal subscription checkout.
     * POST /admin/subscription/checkout
     */
    public function checkout(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plan' => ['required', 'in:monthly,annually'],
        ]);

        $tenant = tenant();
        $planCfg = config("subscription.plans.{$validated['plan']}");

        if (! $planCfg || ! $planCfg['paypal_plan_id']) {
            return back()->withErrors(['plan' => 'Selected plan is not configured.']);
        }

        $domain = $tenant->domains->first()->domain;
        $central = config('tenancy.central_domains')[0];
        $baseUrl = "http://{$domain}.{$central}:8000";

        // plan is appended so the success callback knows which plan was chosen
        $returnUrl = "{$baseUrl}/admin/subscription/success?plan={$validated['plan']}";
        $cancelUrl = "{$baseUrl}/admin/subscription/cancel-return";

        try {
            $result = $this->paypal->createSubscription(
                planId: $planCfg['paypal_plan_id'],
                // Bug 4 fix: pass real name + email from the tenant record
                subscriberName: $tenant->school_name ?? $tenant->id,
                subscriberEmail: $tenant->school_email,
                returnUrl: $returnUrl,
                cancelUrl: $cancelUrl,
            );

            // Persist the pending PayPal subscription ID so success() can look it up
            Subscription::where('tenant_id', $tenant->id)
                ->latest()
                ->first()
                ?->update(['paypal_subscription_id' => $result['id']]);

            return redirect()->away($result['approval_url']);

        } catch (Throwable $e) {
            report($e);

            return back()->withErrors([
                'paypal' => 'Could not connect to PayPal. Please try again or contact support.',
            ]);
        }
    }

    /**
     * Handle the return from PayPal after the user approves the subscription.
     * GET /admin/subscription/success?subscription_id=...&plan=...
     */
    public function success(Request $request): Response|RedirectResponse
    {
        // PayPal appends subscription_id to the return URL automatically
        $paypalSubscriptionId = $request->query('subscription_id');
        $plan = $request->query('plan');

        if (! $paypalSubscriptionId || ! in_array($plan, ['monthly', 'annually'])) {
            return redirect()
                ->route('admin.subscription.index')
                ->withErrors(['paypal' => 'Invalid PayPal return. Please try again.']);
        }

        $tenant = tenant();
        $subscription = Subscription::where('tenant_id', $tenant->id)->latest()->first();

        if (! $subscription) {
            return redirect()
                ->route('admin.subscription.index')
                ->withErrors(['paypal' => 'Subscription record not found. Contact support.']);
        }

        try {
            $paypalData = $this->paypal->getSubscription($paypalSubscriptionId);

            // PayPal sets status to ACTIVE once the first billing cycle is confirmed.
            // APPROVED means the user approved but billing hasn't cycled yet — still valid.
            if (! in_array($paypalData['status'] ?? '', ['ACTIVE', 'APPROVED'])) {
                return redirect()
                    ->route('admin.subscription.index')
                    ->withErrors([
                        'paypal' => 'PayPal subscription is not yet active. Please wait a moment and refresh.',
                    ]);
            }

            $this->subscriptionService->activate($subscription, $plan, $paypalData);

        } catch (Throwable $e) {
            report($e);

            return redirect()
                ->route('admin.subscription.index')
                ->withErrors(['paypal' => 'Could not verify your PayPal subscription. Contact support.']);
        }

        return Inertia::render('admin/subscription/success', [
            'schoolName' => $tenant->school_name ?? $tenant->id,
            'plan' => $plan,
            'planLabel' => config("subscription.plans.{$plan}.label"),
            'amount' => config("subscription.plans.{$plan}.price"),
        ]);
    }

    /**
     * User cancelled on the PayPal approval page — redirect back cleanly.
     * GET /admin/subscription/cancel-return
     */
    public function cancelReturn(): RedirectResponse
    {
        return redirect()
            ->route('admin.subscription.index')
            ->with('info', 'PayPal checkout was cancelled. No payment was made.');
    }

    /**
     * PayPal webhook for recurring billing events.
     * POST /paypal/webhook  (registered on the central domain in routes/web.php)
     */
    public function webhook(Request $request): \Illuminate\Http\JsonResponse
    {
        $eventType = $request->input('event_type');
        $resource = $request->input('resource', []);

        match ($eventType) {
            'BILLING.SUBSCRIPTION.ACTIVATED' => $this->handleActivated($resource),
            'PAYMENT.SALE.COMPLETED' => $this->handlePaymentCompleted($resource),
            'BILLING.SUBSCRIPTION.CANCELLED' => $this->handleCancelled($resource),
            'BILLING.SUBSCRIPTION.SUSPENDED' => $this->handleSuspendedByPayPal($resource),
            default => null,
        };

        return response()->json(['status' => 'ok']);
    }

    // ─── Webhook Handlers ─────────────────────────────────────────────────────

    private function handleActivated(array $resource): void
    {
        // Idempotency guard — already handled in success() callback.
    }

    private function handlePaymentCompleted(array $resource): void
    {
        $paypalSubId = $resource['billing_agreement_id'] ?? null;
        if (! $paypalSubId) {
            return;
        }

        $subscription = Subscription::where('paypal_subscription_id', $paypalSubId)->first();
        if (! $subscription) {
            return;
        }

        SubscriptionPayment::create([
            'tenant_id' => $subscription->tenant_id,
            'subscription_id' => $subscription->id,
            'paypal_subscription_id' => $paypalSubId,
            'paypal_order_id' => $resource['id'] ?? null,
            'plan' => $subscription->plan,
            'amount' => $resource['amount']['total']
                ?? config("subscription.plans.{$subscription->plan}.price"),
            'currency' => 'PHP',
            'status' => 'completed',
            'paid_at' => now(),
        ]);

        // Extend the billing period on each successful renewal
        $subscription->update([
            'current_period_start' => now(),
            'current_period_end' => $subscription->plan === 'monthly'
                ? now()->addMonth()
                : now()->addYear(),
        ]);
    }

    private function handleCancelled(array $resource): void
    {
        $paypalSubId = $resource['id'] ?? null;
        if (! $paypalSubId) {
            return;
        }

        $subscription = Subscription::where('paypal_subscription_id', $paypalSubId)->first();
        $subscription?->update([
            'status' => 'trial_expired', // must re-subscribe
            'canceled_at' => now(),
        ]);
        $subscription?->tenant->update(['status' => 'trial_expired']);
    }

    private function handleSuspendedByPayPal(array $resource): void
    {
        $paypalSubId = $resource['id'] ?? null;
        if (! $paypalSubId) {
            return;
        }

        $subscription = Subscription::where('paypal_subscription_id', $paypalSubId)->first();
        $subscription?->update(['status' => 'trial_expired']);
        $subscription?->tenant->update(['status' => 'trial_expired']);
    }
}
