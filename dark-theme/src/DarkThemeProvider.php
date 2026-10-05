<?php

declare(strict_types=1);

namespace DarkTheme;

use Pterodactyl\Extensions\ExtensionProvider;
use Pterodactyl\Services\Extensions\ExtensionSettingDefinition;
use Pterodactyl\Services\Extensions\ExtensionSettingsDefinition;

/**
 * The theme itself is pure CSS (src/client/theme.css). This provider adds the two
 * things CSS delivered by a bundle cannot do: an admin setting, and a head tag that
 * is already correct in the server-rendered HTML. A theme that wants neither needs
 * no provider at all.
 */
class DarkThemeProvider extends ExtensionProvider
{
    /**
     * Browser toolbar colour (mobile address bar, installed-app title bar). Equal to
     * --theme-color in theme.css, which is the hex form of --background; `npm run
     * contrast` fails when the two drift apart.
     */
    private const string THEME_COLOR = '#090b10';

    public function boot(): void
    {
        // Server-rendered, so guests and signed-in users get it before any script or
        // extension stylesheet has loaded. It replaces the panel's own theme-color tag.
        $this->registerHeadTags([
            ['tag' => 'meta', 'name' => 'theme-color', 'content' => self::THEME_COLOR],
        ]);

        $this->registerSettings(new ExtensionSettingsDefinition($this->settings(), [
            // `color` field: a picker in the admin form; the panel validates and stores a
            // canonical hex or oklch() value, and null (cleared) means "use the theme's own".
            ExtensionSettingDefinition::make('accent_color', 'accent_color', null)
                ->label('Accent colour')
                ->help('Optional. Only the hue and saturation of the colour you pick are used: the theme chooses the lightness itself so buttons, links and focus rings keep WCAG AA contrast. Clear it for the built-in indigo. Applies everywhere, including the sign-in pages, after a reload.')
                ->color()
                // public(): the sign-in pages are themed too, and a colour is safe for anyone to read.
                ->frontend()
                ->public(),
        ]));
    }
}
