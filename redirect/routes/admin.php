<?php

use Illuminate\Support\Facades\Route;
use Redirect\Http\Controllers\AdminRedirectController;

// Base: /api/admin/extensions/redirect
Route::get('/redirects', [AdminRedirectController::class, 'index'])->name('index');
Route::post('/redirects', [AdminRedirectController::class, 'store'])->name('store');
Route::patch('/redirects/{id}', [AdminRedirectController::class, 'update'])->whereNumber('id')->name('update');
Route::delete('/redirects/{id}', [AdminRedirectController::class, 'destroy'])->whereNumber('id')->name('destroy');
