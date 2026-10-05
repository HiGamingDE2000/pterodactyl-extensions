<?php

use Illuminate\Support\Facades\Route;
use Redirect\Http\Controllers\RedirectController;

// Final URL: GET /go/{slug}  (route name: extensions.redirect.root.go.go)
// Mounted by registerRootRoutes(): public, unauthenticated and throttled per client
// by the panel's `throttle:extensions.root` limiter.
Route::get('/{slug}', RedirectController::class)
    ->where('slug', '[A-Za-z0-9_-]{1,64}')
    ->name('go');
