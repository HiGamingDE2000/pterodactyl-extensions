<?php

namespace Redirect;

use Pterodactyl\Extensions\ExtensionProvider;

class RedirectProvider extends ExtensionProvider
{
    public function register(): void
    {
        // No container bindings needed.
    }

    public function boot(): void
    {
        $this->loadExtensionMigrations();

        // routes/admin.php -> /api/admin/extensions/redirect
        $this->registerApiRoutes();

        // routes/root.php -> /go (prefix claimed in the manifest's routes.root; public, throttled)
        $this->registerRootRoutes($this->extensionPath('routes', 'root.php'));
    }
}
