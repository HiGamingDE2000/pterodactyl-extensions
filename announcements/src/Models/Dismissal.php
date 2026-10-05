<?php

namespace Announcements\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $announcement_id
 * @property int $user_id
 */
class Dismissal extends Model
{
    public const UPDATED_AT = null;

    protected $table = 'ext_announcements_dismissals';

    protected $fillable = ['announcement_id', 'user_id'];
}
