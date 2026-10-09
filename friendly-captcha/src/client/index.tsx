import { definePterodactylExtension, http } from '@pterodactyl/sdk';
import FriendlyCaptchaWidget from './FriendlyCaptchaWidget';
import { captchaSession, resetSession, waitForSolution } from './session';

/** POST endpoints whose requests must carry a captcha solution. */
const CAPTCHA_ENDPOINTS = ['/auth/login', '/auth/password', '/auth/password/reset'] as const;

const isCaptchaRequest = (url: string | undefined): boolean => {
    if (!url) {
        return false;
    }

    const path = url.replace(/^https?:\/\/[^\/]+/, '').split('?')[0].replace(/\/+$/, '');

    return (CAPTCHA_ENDPOINTS as readonly string[]).includes(path);
};

export default definePterodactylExtension({
    setup({ config, slots }) {
        if (config.enabled !== true) {
            return;
        }

        if (typeof config.sitekey !== 'string' || config.sitekey === '') {
            return;
        }

        captchaSession.sitekey = config.sitekey;
        captchaSession.endpoint = config.endpoint === 'eu' ? 'eu' : 'global';

        // Attach the solved puzzle token to the auth requests that require a
        // captcha. The core forms send `g-recaptcha-response` (empty while the
        // core reCAPTCHA is disabled); our middleware reads `frc-captcha-response`.
        http.interceptors.request.use(async (requestConfig) => {
            if (!isCaptchaRequest(requestConfig.url)) {
                return requestConfig;
            }

            // Wait for the background puzzle to finish. An empty token on timeout
            // is simply rejected by the backend with the normal error message.
            const token = await waitForSolution();

            requestConfig.data = {
                ...(typeof requestConfig.data === 'object' && requestConfig.data !== null ? requestConfig.data : {}),
                'frc-captcha-response': token,
            };

            return requestConfig;
        });

        // A solution verifies exactly once: reset the widget after every auth
        // attempt so the next one gets a fresh puzzle.
        http.interceptors.response.use(
            (response) => {
                if (isCaptchaRequest(response.config?.url)) {
                    resetSession();
                }

                return response;
            },
            (error: { config?: { url?: string } }) => {
                if (isCaptchaRequest(error.config?.url)) {
                    resetSession();
                }

                return Promise.reject(error);
            },
        );

        // Login: inside the form card, right below the submit button.
        slots.register('auth.login.form.after', FriendlyCaptchaWidget);
        // Password recovery and reset: page-level slots below the form card.
        slots.register('auth.password.after', FriendlyCaptchaWidget);
        slots.register('auth.passwordReset.after', FriendlyCaptchaWidget);
    },
});
