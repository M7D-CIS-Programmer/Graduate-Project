import { useState, useEffect } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after
 * the caller has stopped changing it for `delay` milliseconds.
 *
 * @param {*}      value - The value to debounce.
 * @param {number} delay - Delay in milliseconds (default 400ms).
 * @returns {*} The debounced value.
 */
export const useDebounce = (value, delay = 400) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        // Clear the previous timer if value changes before delay elapses
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
};
