# Friendly Captcha for Pterodactyl (v2)

Replaces Google reCAPTCHA with Friendly Captcha on the panel's login, password
recovery and password reset forms. Friendly Captcha is privacy-friendly
(GDPR, no tracking cookies) and solves a proof-of-work puzzle in the
background — users usually never notice it.

No core files are modified; everything hooks into the panel's extension system.

## Requirements

* Pterodactyl panel v2 (2.0-develop), extensions enabled (default)
* PHP 8.3+
* Node 20+ to build the frontend bundle
* A Friendly Captcha application (sitekey + API key from the dashboard)

## Build

The SDK is not on npm yet — clone the panel next to the extension as `.panel`:

    git clone --branch 2.0-develop https://github.com/pterodactyl/panel ../.panel

Then, inside the extension folder:

    npm ci
    npm run build
    npm run typecheck

## Package & install

From the parent directory:

    zip -r friendly-captcha.zip friendly-captcha

On the panel host:

    php artisan p:extension:install /path/to/friendly-captcha.zip --enable
    php artisan queue:restart
    # reload php-fpm / the panel

Uninstall or disable any time from Admin > Extensions.

## Configure

1. Set `RECAPTCHA_ENABLED=false` in the panel's `.env` (hides the Google widget).
2. Admin > Extensions > Friendly Captcha > Settings:
   * **Enable Friendly Captcha** — on
   * **Sitekey** — from the Friendly Captcha dashboard
   * **API key** — stored encrypted, used for server-side verification
   * **API endpoint** — Global, or EU for the Germany-only region
3. Reload the panel.

## Behaviour notes

* The captcha is verified against the Friendly Captcha siteverify API v2;
  a solution only verifies once, so the widget resets after every attempt.
* If the Friendly Captcha API cannot be reached, requests are accepted
  (fail-open), as recommended by Friendly Captcha. Invalid solutions are
  rejected with HTTP 400, like the core reCAPTCHA middleware does.
* On every auth form the widget sits inside the form card, below the submit
  button. The password pages only offer page-level slots, so the component
  mounts its widget into the card, above the "Return to Login" link.
* Tested against panel 2.0-develop (sdk 2.0.0-beta.4). The v2 extension API is
  still beta and may change.
