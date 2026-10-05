<?php

use CustomButtons\Http\Controllers\AdminItemController;
use Illuminate\Support\Facades\Route;

// Base: /api/admin/extensions/custom-buttons
Route::get('/items', [AdminItemController::class, 'index'])->name('index');
Route::post('/items', [AdminItemController::class, 'store'])->name('store');
Route::patch('/items/{id}', [AdminItemController::class, 'update'])->whereNumber('id')->name('update');
Route::delete('/items/{id}', [AdminItemController::class, 'destroy'])->whereNumber('id')->name('destroy');
