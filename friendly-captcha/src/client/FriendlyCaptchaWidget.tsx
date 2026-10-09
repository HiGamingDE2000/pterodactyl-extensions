import { useEffect, useRef } from 'react';
import { FriendlyCaptchaSDK, type WidgetHandle } from '@friendlycaptcha/sdk';
import { captchaSession, completeSolve, failSolve } from './session';

export default function FriendlyCaptchaWidget() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) {
            return;
        }

        const sdk = new FriendlyCaptchaSDK({ apiEndpoint: captchaSession.endpoint });
        const widget: WidgetHandle = sdk.createWidget({
            element,
            sitekey: captchaSession.sitekey,
        });
        captchaSession.widget = widget;

        const onComplete = (event: Event): void => {
            completeSolve((event as CustomEvent<{ response?: string }>).detail?.response ?? '');
        };
        const onError = (): void => failSolve();
        const onExpire = (): void => {
            captchaSession.solution = null;
            widget.reset();
        };

        element.addEventListener('frc:widget.complete', onComplete);
        element.addEventListener('frc:widget.error', onError);
        element.addEventListener('frc:widget.expire', onExpire);

        return () => {
            element.removeEventListener('frc:widget.complete', onComplete);
            element.removeEventListener('frc:widget.error', onError);
            element.removeEventListener('frc:widget.expire', onExpire);

            const destroyable = widget as unknown as { destroy?: () => void };
            destroyable.destroy?.();

            if (captchaSession.widget === widget) {
                captchaSession.widget = null;
            }

            captchaSession.solution = null;
        };
    }, []);

    return <div ref={containerRef} style={{ marginTop: '1rem' }} />;
}
