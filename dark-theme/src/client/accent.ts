import { notifyThemeChange } from '@pterodactyl/sdk';
import { deriveAccent } from './color';

/**
 * Apply the admin's accent colour by setting the brand tokens as inline custom
 * properties on <html>. Inline declarations outrank every stylesheet rule, so this
 * sits cleanly on top of theme.css without another selector; everything aliased to
 * these tokens (--chart-3, --sidebar-primary, the nav underline, ...) follows.
 *
 * CSS picks the new values up by itself. The console canvas and anything else that
 * copied a token out of CSS is told through notifyThemeChange(), so it repaints.
 *
 * Does nothing when the value is empty/invalid (theme.css defaults stay in force)
 * or when the panel is not in dark mode (this theme only styles `.dark`).
 */
export function applyAccent(value: string): void {
    const root = document.documentElement;
    if (!root.classList.contains('dark')) return;

    const tokens = deriveAccent(value);
    if (!tokens) return;

    for (const [name, color] of Object.entries(tokens)) {
        root.style.setProperty(name, color);
    }
    notifyThemeChange();
}
