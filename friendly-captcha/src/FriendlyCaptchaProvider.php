<?php

declare(strict_types=1);

namespace FriendlyCaptcha;

use FriendlyCaptcha\Http\Middleware\VerifyFriendlyCaptcha;
use Illuminate\Routing\Router;
use Pterodactyl\Extensions\ExtensionProvider;
use Pterodactyl\Services\Extensions\ExtensionSettingDefinition;
use Pterodactyl\Services\Extensions\ExtensionSettingsDefinition;

class FriendlyCaptchaProvider extends ExtensionProvider
{
    public function register(): void
    {
        // The panel defines the `recaptcha` middleware alias in bootstrap/app.php, and the
        // HTTP kernel copies its aliases onto the router exactly once, in its constructor -
        // which runs before extension providers register. Nothing syncs them again during
        // the request, so re-aliasing here sticks: our middleware takes over the auth
        // routes' `recaptcha` middleware, and the extension's settings decide whether it
        // enforces anything. While this extension is disabled or removed, the panel falls
        // back to its own VerifyReCaptcha middleware.
        $this->app->make(Router::class)->aliasMiddleware('recaptcha', VerifyFriendlyCaptcha::class);
    }

    public function boot(): void
    {
        $this->registerSettings(new ExtensionSettingsDefinition($this->settings(), [
            ExtensionSettingDefinition::make('enabled', 'friendly_captcha_enabled', false, [], 'enabled')
                ->field('toggle')
                ->label('Enable Friendly Captcha')
                ->help('Replaces Google reCAPTCHA on the login, password recovery and password reset forms. Keep RECAPTCHA_ENABLED=false in the panel .env so the core Google widget stays hidden.')
                ->frontend()
                ->public()
                ->frontendType('boolean'),

            ExtensionSettingDefinition::make('sitekey', 'friendly_captcha_sitekey', '', ['string', 'max:255'], 'sitekey')
                ->label('Sitekey')
                ->help('The Friendly Captcha sitekey of your application, created in the Friendly Captcha dashboard.')
                ->frontend()
                ->public(),

            ExtensionSettingDefinition::make('api_key', 'friendly_captcha_api_key', '', [], 'api_key')
                ->label('API key')
                ->help('The Friendly Captcha API key used for server-side verification. Stored encrypted and never exposed to the frontend.')
                ->secret(),

            ExtensionSettingDefinition::make('endpoint', 'friendly_captcha_endpoint', 'global', [], 'endpoint')
                ->field('select', [
                    ['value' => 'global', 'label' => 'Global (default)'],
                    ['value' => 'eu', 'label' => 'EU (Germany only)'],
                ])
                ->label('API endpoint')
                ->help('Which Friendly Captcha region to use for puzzles and verification.')
                ->frontend()
                ->public(),
        ]));
    }
}
