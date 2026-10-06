# Custom Buttons

Lets admins add their own link buttons and sidebar items to the server page.

- **Buttons** appear next to the power buttons on the console.
- **Sidebar items** appear in the server navigation.
- Each entry has a label, URL, icon, colour, position and an "open in new tab" option,
  with a live preview while you edit it.
- Entries are ordered with the up and down arrows in the list, and can be switched off
  without deleting them.
- Entries can be limited to one egg, to eggs with a given feature or tag, or to a
  single server.

## Install

Download [custom-buttons.zip](https://github.com/pterodactyl/extensions/releases/latest/download/custom-buttons.zip)
from the latest release, then on the panel host:

```sh
php artisan p:extension:install /path/to/custom-buttons.zip --enable
```

Reload the panel, then manage entries under Admin > Custom Buttons.

## URL placeholders

These are replaced with the server's values, URL-encoded, before the link is shown. The
URL field has a button for each one that adds it where the cursor is:

| Placeholder | Value |
| --- | --- |
| `{{env.P_SERVER_UUID}}` | Server UUID |
| `{{env.P_SERVER_UUID_SHORT}}` | Short server identifier |
| `{{env.P_SERVER_NAME}}` | Server name |
| `{{env.P_SERVER_ID}}` | Internal server ID |
| `{{env.P_SERVER_ALLOCATION_IP}}` | Primary allocation IP |
| `{{env.P_SERVER_ALLOCATION_PORT}}` | Primary allocation port |
| `{{env.P_SERVER_NODE}}` | Node name |
| `{{env.P_SERVER_OWNER}}` | Owner's username |

## Notes

- Only `http://`, `https://` and relative (`/path`) URLs are accepted.
- Icons are [lucide](https://lucide.dev/icons) names, such as `life-buoy`.
- Only root administrators can manage entries; every user with access to a server sees
  the entries that apply to it.

## Credit

Based on the idea of the Custom Buttons plugin for Pelican Panel by Olivier D. and NerdsCorp. Rewritten for the Pterodactyl panel.
