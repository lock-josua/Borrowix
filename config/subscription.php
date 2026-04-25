<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Trial Configuration
    |--------------------------------------------------------------------------
    */
    'trial_days' => 14,

    /*
    |--------------------------------------------------------------------------
    | Warning email sent when this many days remain in trial
    |--------------------------------------------------------------------------
    */
    'trial_warning_days_remaining' => 10,

    /*
    |--------------------------------------------------------------------------
    | Plans
    |--------------------------------------------------------------------------
    | Prices are in PHP (₱). Stored as integers (full pesos, not centavos).
    | paypal_plan_id must match a Subscription Plan pre-created in the
    | PayPal sandbox/live dashboard using the Subscriptions v2 API.
    */
    'plans' => [
        'monthly' => [
            'label' => 'Monthly',
            'price' => 999,
            'currency' => 'PHP',
            'paypal_plan_id' => env('PAYPAL_MONTHLY_PLAN_ID'),
        ],
        'annually' => [
            'label' => 'Annual',
            'price' => 9_990,
            'currency' => 'PHP',
            'paypal_plan_id' => env('PAYPAL_ANNUAL_PLAN_ID'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | PayPal (mirrored here for SubscriptionService convenience)
    |--------------------------------------------------------------------------
    | The primary PayPal config lives in config/paypal.php and is consumed
    | by srmklive. This block is only used by PayPalService for mode checks.
    */
    'paypal' => [
        'client_id' => env('PAYPAL_SANDBOX_CLIENT_ID'),
        'client_secret' => env('PAYPAL_SANDBOX_CLIENT_SECRET'),
        'mode' => env('PAYPAL_MODE', 'sandbox'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Statuses
    |--------------------------------------------------------------------------
    */
    'statuses' => ['trialing', 'subscribed', 'trial_expired', 'suspended'],

];
