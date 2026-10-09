export interface CaptchaSession {
    sitekey: string;
    endpoint: 'global' | 'eu';
    /** The current, not-yet-used solution; null while the widget is solving. */
    solution: string | null;
    /** The currently mounted widget, so interceptors can reset it. */
    widget: { reset: () => void } | null;
    /** Pending interceptors waiting for the widget to complete. */
    waiters: Array<(token: string) => void>;
}

export const captchaSession: CaptchaSession = {
    sitekey: '',
    endpoint: 'global',
    solution: null,
    widget: null,
    waiters: [],
};

/** Called by the widget on frc:widget.complete; wakes up waiting interceptors. */
export const completeSolve = (token: string): void => {
    captchaSession.solution = token;
    const waiters = captchaSession.waiters.splice(0);
    waiters.forEach((resolve) => resolve(token));
};

/** Called on frc:widget.error; waiting requests continue with an empty token. */
export const failSolve = (): void => {
    captchaSession.solution = null;
    const waiters = captchaSession.waiters.splice(0);
    waiters.forEach((resolve) => resolve(''));
};

/** Clears the used solution and lets the widget solve a fresh puzzle. */
export const resetSession = (): void => {
    captchaSession.solution = null;
    captchaSession.widget?.reset();
};

/** Resolves with the solution once solved, or '' after the timeout. */
export const waitForSolution = (timeoutMs = 30_000): Promise<string> => {
    const { solution } = captchaSession;
    if (solution !== null) {
        return Promise.resolve(solution);
    }

    return new Promise<string>((resolve) => {
        let timeout: ReturnType<typeof setTimeout> | undefined;

        const finish = (token: string): void => {
            clearTimeout(timeout);
            captchaSession.waiters = captchaSession.waiters.filter((waiter) => waiter !== finish);
            resolve(token);
        };

        timeout = setTimeout(() => finish(''), timeoutMs);
        captchaSession.waiters.push(finish);
    });
};
