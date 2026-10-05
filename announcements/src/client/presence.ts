import { useEffect, useRef, useState } from 'react';

/**
 * Lets a dialog that is shown for a value (the row being edited, or 'new') animate
 * in and out. The dialog stays mounted: `open` turns true in an effect, after the
 * dialog has first rendered closed, so the enter transition runs, and the last value
 * is kept after it is cleared, so the exit transition still has content. `key`
 * changes on every opening so the dialog's form state starts fresh.
 */
export function usePresence<T>(value: T | null): { value: T | null; open: boolean; key: number } {
    const retained = useRef<T | null>(value);
    const opening = useRef(0);
    const present = useRef(false);

    if (value !== null) {
        if (!present.current) opening.current += 1;
        retained.current = value;
    }
    present.current = value !== null;

    const isPresent = value !== null;
    const [entered, setEntered] = useState(false);
    useEffect(() => {
        setEntered(isPresent);
    }, [isPresent]);

    return { value: retained.current, open: isPresent && entered, key: opening.current };
}
