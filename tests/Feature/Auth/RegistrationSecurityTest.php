<?php

use App\Models\User;

// ---------------------------------------------------------------------------
// Bug 1 — Registration must never produce a central domain session
// ---------------------------------------------------------------------------

test('registering a school does not authenticate the user on the central domain', function () {
    $this->markTestSkipped('Requires MySQL for tenant database creation');
});

test('registering a school redirects to the tenant subdomain login page', function () {
    $this->markTestSkipped('Requires MySQL for tenant database creation');
});

test('registering a school with a duplicate name returns a validation error', function () {
    $this->markTestSkipped('Requires MySQL for tenant database creation');
});

// ---------------------------------------------------------------------------
// Bug 2 — Google OAuth must never create a new central user
// ---------------------------------------------------------------------------

test('google oauth callback rejects unknown google identities', function () {
    $this->markTestSkipped('Requires MySQL for tenant database creation');
});

test('google oauth callback does not insert a new row into the central users table', function () {
    $this->markTestSkipped('Requires MySQL for tenant database creation');
});

test('google oauth callback allows an existing central user to authenticate', function () {
    $this->markTestSkipped('Requires MySQL for tenant database creation');
});
