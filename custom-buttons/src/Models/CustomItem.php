<?php

namespace CustomButtons\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Pterodactyl\Models\Server;

/**
 * @property int $id
 * @property string $kind
 * @property string $label
 * @property string $url
 * @property string|null $icon
 * @property string $color
 * @property bool $new_tab
 * @property string $position
 * @property int $sort
 * @property bool $is_active
 * @property int|null $server_id
 * @property int|null $egg_id
 * @property string|null $feature
 * @property Server|null $server
 * @property CarbonInterface $created_at
 * @property CarbonInterface $updated_at
 */
class CustomItem extends Model
{
    public const KIND_BUTTON = 'button';

    public const KIND_SIDEBAR = 'sidebar';

    public const KINDS = [self::KIND_BUTTON, self::KIND_SIDEBAR];

    public const POSITIONS = ['before', 'after'];

    public const COLORS = ['primary', 'success', 'warning', 'danger', 'info', 'gray'];

    protected $table = 'ext_custom_buttons_items';

    protected $fillable = [
        'kind',
        'label',
        'url',
        'icon',
        'color',
        'new_tab',
        'position',
        'sort',
        'is_active',
        'server_id',
        'egg_id',
        'feature',
    ];

    protected $attributes = [
        'color' => 'primary',
        'position' => 'after',
        'sort' => 0,
        'new_tab' => true,
        'is_active' => true,
    ];

    protected function casts(): array
    {
        return [
            'new_tab' => 'boolean',
            'is_active' => 'boolean',
            'sort' => 'integer',
            'server_id' => 'integer',
            'egg_id' => 'integer',
        ];
    }

    /** The server this item is limited to, when it has one. */
    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /** Items that are global or pinned to the given server. */
    public function scopeForServer(Builder $query, Server $server): Builder
    {
        return $query->where(fn (Builder $q) => $q->whereNull('server_id')->orWhere('server_id', $server->id));
    }
}
