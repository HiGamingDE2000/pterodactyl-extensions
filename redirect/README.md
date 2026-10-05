# Redirect

Short links served by the panel. Create a slug and a destination, for example
`discord` pointing at an invite link, and `https://your-panel.example/go/discord`
redirects there.

## Install

Download [redirect.zip](https://github.com/pterodactyl/pterodactyl-extensions/releases/latest/download/redirect.zip)
from the latest release, then on the panel host, either run:

```sh
php artisan p:extension:install /path/to/redirect.zip --enable
```

Or install the extension using the admin panel under Admin > Extensions.

Reload the panel, then manage links under Admin > Redirects. The list shows each
link with a copy button, its destination, and how often and how recently it has been
used. Links can be switched off and on from the list without deleting them, and a
filter box narrows the list by name or destination.

## Notes

- Links live under `/go/`. The panel refuses to enable the extension if another
  extension already uses that prefix.
- Slugs are 1-64 characters: lowercase letters, digits, `-` and `_`.
- Destinations must be full `http://` or `https://` URLs.
- Redirects are temporary (302) by default; permanent (301) can be chosen per link.
  Browsers cache permanent redirects, so later edits may not reach them.
- Only root administrators can manage links.
