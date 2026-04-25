<?php

namespace App\Services;

use RuntimeException;
use Srmklive\PayPal\Services\PayPal as PayPalClient;

class PayPalService
{
    private PayPalClient $client;

    public function __construct()
    {
        $this->client = new PayPalClient;

        // Bug 1 fix: pass config('paypal') — the full nested srmklive shape,
        // NOT config('subscription.paypal') which is a flat convenience block.
        $this->client->setApiCredentials(config('paypal'));

        // Bug 3 fix: getAccessToken() MUST be called after setApiCredentials()
        // and before any API method. srmklive will 401 on every call without it.
        $this->client->getAccessToken();
    }

    /**
     * Create a PayPal Subscription and return the approval URL + subscription ID.
     *
     * @return array{id: string|null, approval_url: string}
     *
     * @throws RuntimeException
     */
    public function createSubscription(
        string $planId,
        string $subscriberName,
        string $subscriberEmail,
        string $returnUrl,
        string $cancelUrl
    ): array {
        $response = $this->client
            ->addBillingPlanById($planId)
            ->setReturnAndCancelUrl($returnUrl, $cancelUrl)
            // Bug 4 fix: pass real subscriber name + email, not tenant ID and
            // a fake constructed address. PayPal validates the subscriber data.
            ->setupSubscription($subscriberName, $subscriberEmail);

        // Bug 2 fix: never use links[0] — PayPal returns multiple links and the
        // order is not guaranteed. Always find the link by its 'rel' value.
        $approvalUrl = collect($response['links'] ?? [])
            ->firstWhere('rel', 'approve')['href'] ?? null;

        if (! $approvalUrl) {
            throw new RuntimeException(
                'PayPal did not return an approval URL. Response: '.json_encode($response)
            );
        }

        return [
            'id' => $response['id'] ?? null,
            'approval_url' => $approvalUrl,
        ];
    }

    /**
     * Fetch full subscription details from PayPal by subscription ID.
     *
     * @throws RuntimeException
     */
    public function getSubscription(string $paypalSubscriptionId): array
    {
        $response = $this->client->showSubscriptionDetails($paypalSubscriptionId);

        if (empty($response['id'])) {
            throw new RuntimeException(
                'PayPal returned invalid subscription details: '.json_encode($response)
            );
        }

        return $response;
    }

    /**
     * Cancel an active PayPal subscription.
     */
    public function cancelSubscription(string $paypalSubscriptionId, string $reason): void
    {
        $this->client->cancelSubscription($paypalSubscriptionId, $reason);
    }
}
