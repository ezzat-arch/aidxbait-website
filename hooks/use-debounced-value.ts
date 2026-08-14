import { useEffect, useState } from "react";

type DebouncedValueOptions<T> = {
	/**
	 * Values matching this predicate bypass the delay and apply immediately.
	 * Lets a "clear" action land without the previous value being flushed
	 * afterwards by an in-flight timer.
	 */
	immediateWhen?: (value: T) => boolean;
};

/** Returns `value` after it stops changing for `delayMs`. */
export function useDebouncedValue<T>(
	value: T,
	delayMs: number,
	options?: DebouncedValueOptions<T>
): T {
	const [debounced, setDebounced] = useState(value);
	const isImmediate = options?.immediateWhen?.(value) ?? false;

	useEffect(() => {
		if (isImmediate) {
			setDebounced(value);
			return;
		}
		const timer = window.setTimeout(() => setDebounced(value), delayMs);
		return () => window.clearTimeout(timer);
	}, [value, delayMs, isImmediate]);

	return isImmediate ? value : debounced;
}
