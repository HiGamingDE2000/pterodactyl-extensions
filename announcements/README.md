# Announcements

Panel-wide announcement banners. Admins write announcements; users see them as coloured
banners and can dismiss them.

- Title, body, type (info, success, warning, danger), optional link and icon.
- Optional start and end time.
- Show on the server list, the server console, the admin overview, or everywhere.
- Optional per-user dismissal.
- Email an announcement to all users.

## Install

Download [announcements.zip](https://github.com/pterodactyl/extensions/releases/latest/download/announcements.zip)
from the latest release, then on the panel host:

```sh
php artisan p:extension:install /path/to/announcements.zip --enable
```

Reload the panel, then manage announcements under Admin > Announcements.

## Notes

- Only root administrators can manage announcements.
- Emails are queued, so a queue worker must be running for them to send.

## Credit

Based on the idea of the Announcements plugin for Pelican Panel by Boy132. Rewritten for the Pterodactyl panel.
