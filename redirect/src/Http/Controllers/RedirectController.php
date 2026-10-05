<?php

namespace Redirect\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Redirect\Models\ShortRedirect;
use Redirect\Rules\AbsoluteHttpUrl;

class RedirectController
{
    /** Public endpoint: send the visitor to the redirect's target. */
    public function __invoke(string $slug): RedirectResponse
    {
        $redirect = ShortRedirect::query()
            ->where('slug', mb_strtolower($slug))
            ->where('enabled', true)
            ->first();

        // Re-check the stored target so a bad row (e.g. edited directly in the database) never redirects.
        if ($redirect === null || ! AbsoluteHttpUrl::isValid($redirect->target)) {
            abort(404);
        }

        // Atomic counter bump; never read-modify-write.
        ShortRedirect::query()->whereKey($redirect->id)->increment('hits', 1, ['last_hit_at' => now()]);

        $response = new RedirectResponse($redirect->target, $redirect->status_code);
        $response->headers->set('Referrer-Policy', 'no-referrer');
        if ($redirect->status_code !== 301) {
            $response->headers->set('Cache-Control', 'no-store');
        }

        return $response;
    }
}
