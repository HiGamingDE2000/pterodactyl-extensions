<?php

namespace Redirect\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Redirect\Http\Requests\RedirectRequest;
use Redirect\Models\ShortRedirect;

class AdminRedirectController
{
    public function index(): JsonResponse
    {
        return new JsonResponse([
            'data' => ShortRedirect::query()->orderBy('slug')->get()->map(fn (ShortRedirect $r) => $this->present($r))->all(),
        ]);
    }

    public function store(RedirectRequest $request): JsonResponse
    {
        $redirect = ShortRedirect::query()->create($request->validated());

        return new JsonResponse(['data' => $this->present($redirect->refresh())], 201);
    }

    public function update(RedirectRequest $request, int $id): JsonResponse
    {
        $redirect = ShortRedirect::query()->findOrFail($id);
        $redirect->update($request->validated());

        return new JsonResponse(['data' => $this->present($redirect->refresh())]);
    }

    public function destroy(int $id): Response
    {
        ShortRedirect::query()->findOrFail($id)->delete();

        return new Response('', 204);
    }

    /** @return array<string, mixed> */
    private function present(ShortRedirect $redirect): array
    {
        return [
            'id' => $redirect->id,
            'slug' => $redirect->slug,
            'target' => $redirect->target,
            'status_code' => $redirect->status_code,
            'enabled' => $redirect->enabled,
            'hits' => $redirect->hits,
            'url' => route('extensions.redirect.root.go.go', ['slug' => $redirect->slug]),
            'last_hit_at' => $redirect->last_hit_at?->toIso8601String(),
            'created_at' => $redirect->created_at->toIso8601String(),
        ];
    }
}
