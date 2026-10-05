<?php

namespace CustomButtons;

use Pterodactyl\Extensions\ExtensionProvider;

class CustomButtonsProvider extends ExtensionProvider
{
    public function register(): void
    {
        // No container bindings needed.
    }

    public function boot(): void
    {
        $this->loadExtensionMigrations();

        // routes/admin.php  -> /api/admin/extensions/custom-buttons
        // routes/server.php -> /api/client/servers/{server}/extensions/custom-buttons
        $this->registerApiRoutes();
    }
}
