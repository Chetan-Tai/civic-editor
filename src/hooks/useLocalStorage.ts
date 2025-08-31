import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(initialValue);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const item = window.localStorage.getItem(key);
            if (item) setValue(JSON.parse(item));
        } catch {}
        setLoaded(true);
    }, [key]);

    useEffect(() => {
        if (!loaded) return;
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {}
    }, [key, value, loaded]);

    return [value, setValue, loaded] as const;
}