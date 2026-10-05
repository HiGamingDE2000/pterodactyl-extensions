// The token file. The SDK's Vite preset extracts it to dist/ and makes the bundle
// wait for the stylesheet to load before setup() runs, so there is no moment where
// setup has run but the tokens have not arrived.
import './theme.css';
import { defineConfiguredExtension } from '@pterodactyl/sdk';
import { applyAccent } from './accent';

// A theme needs no slots, screens or components: importing the CSS is the whole job.
// setup() is only used to apply the one admin setting. It is a ->frontend()->public()
// setting, so guests on the sign-in pages receive it too; it is null until an admin picks one.
export default defineConfiguredExtension(
    (config) => ({ accent_color: typeof config.accent_color === 'string' ? config.accent_color : '' }),
    {
        setup({ config }) {
            applyAccent(config.accent_color);
        },
    }
);
