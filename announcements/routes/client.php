<?php

use Announcements\Http\Controllers\ClientAnnouncementController;
use Illuminate\Support\Facades\Route;

// Base: /api/client/extensions/announcements
Route::get('/active', [ClientAnnouncementController::class, 'active'])->name('active');
Route::post('/{id}/dismiss', [ClientAnnouncementController::class, 'dismiss'])->whereNumber('id')->name('dismiss');
