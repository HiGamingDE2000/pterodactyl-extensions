<?php

namespace Announcements;

use Pterodactyl\Extensions\ExtensionProvider;

class AnnouncementsProvider extends ExtensionProvider
{
    public function register(): void
    {
        // No container bindings needed.
    }

    public function boot(): void
    {
        $this->loadExtensionMigrations();

        // routes/client.php -> /api/client/extensions/announcements
        // routes/admin.php  -> /api/admin/extensions/announcements
        $this->registerApiRoutes();
    }
}
