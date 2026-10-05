# Dark Theme

A deeper, neutral dark theme for the Pterodactyl panel. It restyles the dashboard,
server pages, admin area and login screens, including the console, text selection
and scrollbars.

It works purely by overriding the panel's design tokens, so it keeps working as the
panel's components change.

## Install

Download [dark-theme.zip](https://github.com/pterodactyl/pterodactyl-extensions/releases/latest/download/dark-theme.zip)
from the latest release, then on the panel host, either run:

```sh
php artisan p:extension:install /path/to/dark-theme.zip --enable
```

Or install the extension using the admin panel under Admin > Extensions.

Reload the panel. Disable the extension to get the stock look back.

## Settings

Admin > Extensions > Dark Theme.

| Setting | Default | What it does |
| --- | --- | --- |
| Accent colour | Indigo | Colour used for buttons, links and focus rings. Pick any colour; its lightness is adjusted so text stays readable. Clear it to return to the default. |

## Making your own theme

The whole theme is one file: [`src/client/theme.css`](src/client/theme.css). It
contains only CSS custom properties, grouped and commented.

1. Copy this extension and change the `id` and `name` in `extension.json`.
2. Edit the values in `src/client/theme.css`.
3. Run `npm run contrast` to check that your text colours are readable on their
   backgrounds (WCAG AA).
4. Build it with `npm ci && npm run build` (see the repository README for the SDK
   setup) and install the folder with `php artisan p:extension:install`.

Keep the rules under `:root.dark` and outside any `@layer`, as the file's header
comment explains; otherwise the panel's own values win.

The full list of tokens is in the panel's `docs/theming/tokens.md`.

## Limits

- On a hard reload the stock colours show for a moment before the theme loads.
- Favicons, shadows and scrollbar width are not controlled by tokens.
