<?php

namespace CustomButtons\Http\Controllers;

use CustomButtons\Models\CustomItem;
use CustomButtons\Services\UrlTemplate;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Server;

class ServerItemController
{
    /**
     * Buttons and sidebar items applicable to this server, with placeholders
     * already substituted. Entries whose resolved URL is not safe are dropped.
     */
    public function __invoke(Server $server): JsonResponse
    {
        $egg = Egg::query()->with('tags')->find($server->egg_id);
        $features = array_values(array_filter((array) ($egg?->features ?? []), 'is_string'));
        $tags = $egg ? $egg->tags->pluck('slug')->filter(fn ($slug) => is_string($slug))->values()->all() : [];

        $items = CustomItem::query()
            ->active()
            ->forServer($server)
            ->orderBy('sort')
            ->orderBy('id')
            ->get()
            ->filter(fn (CustomItem $item) => $this->applies($item, $server, $features, $tags));

        $buttons = [];
        $sidebar = [];
        foreach ($items as $item) {
            $url = UrlTemplate::resolve($item->url, $server);
            if ($url === null) {
                continue;
            }

            $payload = [
                'id' => $item->id,
                'label' => $item->label,
                'url' => $url,
                'icon' => $item->icon,
                'color' => $item->color,
                'new_tab' => $item->new_tab,
                'position' => $item->position,
            ];

            if ($item->kind === CustomItem::KIND_SIDEBAR) {
                $sidebar[] = $payload;
            } else {
                $buttons[] = $payload;
            }
        }

        return new JsonResponse(['data' => ['buttons' => $buttons, 'sidebar' => $sidebar]]);
    }

    /**
     * @param  list<string>  $features
     * @param  list<string>  $tags
     */
    private function applies(CustomItem $item, Server $server, array $features, array $tags): bool
    {
        if ($item->egg_id !== null && $item->egg_id !== $server->egg_id) {
            return false;
        }

        if ($item->feature !== null && ! in_array($item->feature, $features, true) && ! in_array($item->feature, $tags, true)) {
            return false;
        }

        return true;
    }
}
