import { useEffect, useRef } from 'react';
import { FriendlyCaptchaSDK, type WidgetHandle } from '@friendlycaptcha/sdk';
import { captchaSession, completeSolve, failSolve } from './session';

export default function FriendlyCaptchaWidget() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        // The panel only offers page-level slots on the password pages, so a slot
        // component would render below the form card there. Those pages place
        // their "Return to Login" block inside the card, right below the submit
        // button - the same spot the panel's own (invisible) captcha occupies -
        // so mount into the card, above that block, when it is found. The node
        // is created outside React's tree on purpose: React must never delete or
        // re-parent DOM nodes it rendered, so the relocated widget is fully
        // managed by this component.
        const anchor = container.ownerDocument.querySelector<HTMLAnchorElement>("a[href='/auth/login']");
        const anchorBlock = anchor?.closest('div');
        const mountParent = anchorBlock?.parentElement;
        const external = Boolean(mountParent && anchorBlock && !mountParent.contains(container));
        const element: HTMLElement = external ? container.ownerDocument.createElement('div') : container;

        element.style.marginTop = '1rem';
        if (external && mountParent && anchorBlock) {
            mountParent.insertBefore(element, anchorBlock);
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

            if (external) {
                element.remove();
            }

            if (captchaSession.widget === widget) {
                captchaSession.widget = null;
            }

            captchaSession.solution = null;
        };
    }, []);

    return <div ref={containerRef} />;
}
