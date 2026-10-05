# Pterodactyl Extensions

Extensions for the Pterodactyl panel (v2). Each folder is one extension.

| Extension | What it does | Download |
| --- | --- | --- |
| [Announcements](announcements) | Panel-wide announcement banners that users can dismiss. | [announcements.zip](https://github.com/pterodactyl/pterodactyl-extensions/releases/latest/download/announcements.zip) |
| [Custom Buttons](custom-buttons) | Admin-defined link buttons and sidebar items on the server page. | [custom-buttons.zip](https://github.com/pterodactyl/pterodactyl-extensions/releases/latest/download/custom-buttons.zip) |
| [Dark Theme](dark-theme) | A deeper, neutral dark theme, and a template for writing your own. | [dark-theme.zip](https://github.com/pterodactyl/pterodactyl-extensions/releases/latest/download/dark-theme.zip) |
| [Redirect](redirect) | Short links served by the panel, such as `/go/discord`. | [redirect.zip](https://github.com/pterodactyl/pterodactyl-extensions/releases/latest/download/redirect.zip) |
| [SSO](sso) | OAuth login for various third party providers such as Discord. | [sso.zip](https://github.com/pterodactyl/pterodactyl-extensions/releases/latest/download/sso.zip) |

## Installing an extension

Download its zip from the [latest release](https://github.com/pterodactyl/pterodactyl-extensions/releases/latest), then on the panel host, either run:

```sh
php artisan p:extension:install /path/to/extension.zip --enable
```

Or install the extension using the admin panel under Admin > Extensions.

Reload the panel afterwards. Extensions can be disabled or removed again from
Admin > Extensions.

## Developing

Extensions build against the panel's SDK, which is not published to npm yet. Clone the
panel into `.panel` at the root of this repository (it is git-ignored):

```sh
git clone --branch 2.0-develop https://github.com/pterodactyl/panel .panel
```

Then, inside an extension's folder:

```sh
npm ci
npm run build
npm run typecheck
```

`node scripts/check.mjs <folder>` runs the same package checks as CI.

## Adding an extension

1. Create a folder named after the extension's `id` with its `extension.json`,
   `package.json` and a `README.md`.
2. Depend on the SDK with `"@pterodactyl/sdk": "file:../.panel/packages/sdk"`.
3. If it uses Tailwind, give it its own short prefix: set `ui.prefix` in `extension.json`
   (2-12 lowercase letters, unique among extensions) and build its stylesheet with
   `prefix(<prefix>)`, so its classes read `<prefix>:flex`. The panel rejects styles that
   do not use the declared prefix.
4. Add a row to the table above, linking to
   `releases/latest/download/<id>.zip`.

CI builds, typechecks and packages every folder that contains an `extension.json`.

## Releasing

Bump the `version` in the extension's `extension.json` and `package.json`, then push
a tag:

```sh
git tag v1.0.0
git push origin v1.0.0
```

The release contains one `<id>.zip` per extension.
