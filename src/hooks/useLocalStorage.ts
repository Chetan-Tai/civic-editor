import * as React from "react";

export function useLocalStorage<T>(key: string, initial: T) {
    const [state, setState] = React.useState<T>(initial);

    React.useEffect(() => {
        try {
        const raw = localStorage.getItem(key);
        if (raw) setState(JSON.parse(raw) as T);
        } catch {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    React.useEffect(() => {
        try {
        localStorage.setItem(key, JSON.stringify(state));
        } catch {}
    }, [key, state]);

    return [state, setState] as const;
}
