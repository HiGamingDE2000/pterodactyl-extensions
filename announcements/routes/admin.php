<?php

use Announcements\Http\Controllers\AdminAnnouncementController;
use Illuminate\Support\Facades\Route;

// Base: /api/admin/extensions/announcements
Route::get('/announcements', [AdminAnnouncementController::class, 'index'])->name('index');
Route::post('/announcements', [AdminAnnouncementController::class, 'store'])->name('store');
Route::patch('/announcements/{id}', [AdminAnnouncementController::class, 'update'])->whereNumber('id')->name('update');
Route::delete('/announcements/{id}', [AdminAnnouncementController::class, 'destroy'])->whereNumber('id')->name('destroy');
Route::post('/announcements/{id}/email', [AdminAnnouncementController::class, 'email'])->whereNumber('id')->name('email');
