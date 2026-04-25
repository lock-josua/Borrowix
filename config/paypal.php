<?php

/*
|--------------------------------------------------------------------------
| PayPal Configuration
|--------------------------------------------------------------------------
|
| This config is consumed by srmklive/paypal via setApiCredentials().
| The shape MUST match what srmklive expects — nested sandbox/live keys.
|
| DO NOT flatten this to client_id/client_secret at the top level.
| srmklive reads config('paypal.sandbox.client_id') internally.
|
*/

return [

    'mode' => env('PAYPAL_MODE', 'sandbox'), // 'sandbox' or 'live'

    'sandbox' => [
        'client_id' => env('PAYPAL_SANDBOX_CLIENT_ID', ''),
        'client_secret' => env('PAYPAL_SANDBOX_CLIENT_SECRET', ''),
        'app_id' => 'APP-80W284485P519543T',
    ],

    'live' => [
        'client_id' => env('PAYPAL_LIVE_CLIENT_ID', ''),
        'client_secret' => env('PAYPAL_LIVE_CLIENT_SECRET', ''),
        'app_id' => '',
    ],

    'payment_action' => env('PAYPAL_PAYMENT_ACTION', 'Sale'),
    'currency' => env('PAYPAL_CURRENCY', 'USD'),
    'notify_url' => env('PAYPAL_NOTIFY_URL', ''),
    'locale' => 'en_US',
    'validate_ssl' => env('PAYPAL_VALIDATE_SSL', true),
];
