<?php

use CustomButtons\Http\Controllers\ServerItemController;
use Illuminate\Support\Facades\Route;

// Base: /api/client/servers/{server}/extensions/custom-buttons
Route::get('/items', ServerItemController::class)->name('items');
