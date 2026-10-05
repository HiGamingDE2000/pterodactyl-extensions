<?php

namespace Redirect\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $slug
 * @property string $target
 * @property int $status_code
 * @property bool $enabled
 * @property int $hits
 * @property CarbonInterface|null $last_hit_at
 * @property CarbonInterface $created_at
 * @property CarbonInterface $updated_at
 */
class ShortRedirect extends Model
{
    /** HTTP statuses a redirect may use: temporary (default) or permanent. */
    public const STATUS_CODES = [302, 301];

    protected $table = 'ext_redirect_redirects';

    protected $fillable = ['slug', 'target', 'status_code', 'enabled'];

    protected $attributes = [
        'status_code' => 302,
        'enabled' => true,
        'hits' => 0,
    ];

    protected function casts(): array
    {
        return [
            'status_code' => 'integer',
            'enabled' => 'boolean',
            'hits' => 'integer',
            'last_hit_at' => 'datetime',
        ];
    }
}
