import { useState, useEffect } from 'react';

/**
 * Drop-in replacement for useState that persists string values to sessionStorage.
 * - Restores the value when the component remounts (e.g. after navigation).
 * - Clears automatically when the browser tab is closed (sessionStorage lifetime).
 *
 * Usage:
 *   const [jobTitle, setJobTitle] = useFormCache('cva_jobTitle');
 *   const [jobTitle, setJobTitle] = useFormCache('cva_jobTitle', 'default text');
 */
export function useFormCache(storageKey, defaultValue = '') {
    const [value, setValue] = useState(() => {
        try {
            const cached = sessionStorage.getItem(storageKey);
            return cached !== null ? cached : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            if (value) {
                sessionStorage.setItem(storageKey, value);
            } else {
                sessionStorage.removeItem(storageKey);
            }
        } catch {}
    }, [storageKey, value]);

    return [value, setValue];
}
