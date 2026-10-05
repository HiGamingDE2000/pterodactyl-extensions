<?php

namespace Announcements\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $title
 * @property string|null $body
 * @property string $type
 * @property string|null $icon
 * @property string|null $url_label
 * @property string|null $url_link
 * @property string[]|null $panels
 * @property bool $dismissible
 * @property CarbonInterface|null $valid_from
 * @property CarbonInterface|null $valid_to
 * @property CarbonInterface $created_at
 * @property CarbonInterface $updated_at
 */
class Announcement extends Model
{
    public const TYPES = ['info', 'success', 'warning', 'danger'];

    /** Areas an announcement can be shown in. An empty list means every area. */
    public const AREAS = ['dashboard', 'server', 'admin'];

    protected $table = 'ext_announcements_announcements';

    protected $fillable = [
        'title',
        'body',
        'type',
        'icon',
        'url_label',
        'url_link',
        'panels',
        'dismissible',
        'valid_from',
        'valid_to',
    ];

    protected $attributes = [
        'type' => 'info',
        'dismissible' => true,
    ];

    protected function casts(): array
    {
        return [
            'panels' => 'array',
            'dismissible' => 'boolean',
            'valid_from' => 'datetime',
            'valid_to' => 'datetime',
        ];
    }

    public function dismissals(): HasMany
    {
        return $this->hasMany(Dismissal::class, 'announcement_id');
    }

    /** Announcements whose validity window contains the current moment. */
    public function scopeActive(Builder $query): Builder
    {
        return $query
            ->where(fn (Builder $q) => $q->whereNull('valid_from')->orWhere('valid_from', '<=', now()))
            ->where(fn (Builder $q) => $q->whereNull('valid_to')->orWhere('valid_to', '>=', now()));
    }

    public function showsInArea(string $area): bool
    {
        return empty($this->panels) || in_array($area, $this->panels, true);
    }
}
