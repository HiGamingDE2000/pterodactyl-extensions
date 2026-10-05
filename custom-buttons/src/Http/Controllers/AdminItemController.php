<?php

namespace CustomButtons\Http\Controllers;

use CustomButtons\Http\Requests\ItemRequest;
use CustomButtons\Models\CustomItem;
use CustomButtons\Services\UrlTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Pterodactyl\Models\Egg;

class AdminItemController
{
    public function index(): JsonResponse
    {
        $items = CustomItem::query()->with('server:id,name')->orderBy('kind')->orderBy('sort')->orderBy('id')->get();

        return new JsonResponse([
            'data' => $items->map(fn (CustomItem $item) => $this->present($item))->all(),
            'meta' => [
                'placeholders' => UrlTemplate::PLACEHOLDERS,
                'eggs' => Egg::query()->orderBy('name')->get(['id', 'name'])
                    ->map(fn (Egg $egg) => ['id' => $egg->id, 'name' => $egg->name])->all(),
            ],
        ]);
    }

    public function store(ItemRequest $request): JsonResponse
    {
        $item = CustomItem::query()->create($this->attributes($request));

        return new JsonResponse(['data' => $this->present($item)], 201);
    }

    public function update(ItemRequest $request, int $id): JsonResponse
    {
        $item = CustomItem::query()->findOrFail($id);
        $item->update($this->attributes($request));

        return new JsonResponse(['data' => $this->present($item->refresh())]);
    }

    public function destroy(int $id): Response
    {
        CustomItem::query()->findOrFail($id)->delete();

        return new Response('', 204);
    }

    /** @return array<string, mixed> */
    private function attributes(ItemRequest $request): array
    {
        $data = $request->validated();
        $data['url'] = trim($data['url']);
        $data['icon'] = ($data['icon'] ?? null) ?: null;
        $data['feature'] = isset($data['feature']) && trim($data['feature']) !== '' ? trim($data['feature']) : null;

        return $data;
    }

    /** @return array<string, mixed> */
    private function present(CustomItem $item): array
    {
        $item->loadMissing('server:id,name');

        return [
            'id' => $item->id,
            'kind' => $item->kind,
            'label' => $item->label,
            'url' => $item->url,
            'icon' => $item->icon,
            'color' => $item->color,
            'new_tab' => $item->new_tab,
            'position' => $item->position,
            'sort' => $item->sort,
            'is_active' => $item->is_active,
            'server_id' => $item->server_id,
            'egg_id' => $item->egg_id,
            'feature' => $item->feature,
            'server_name' => $item->server?->name,
        ];
    }
}
