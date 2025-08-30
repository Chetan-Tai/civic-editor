import * as React from "react";
import type { RewriteMode } from "@/lib/ai";
import { rewriteText } from "@/lib/ai";

export function useAI() {
    const rewrite = React.useCallback(async (text: string, mode: RewriteMode) => {
        return rewriteText(text, mode);
    }, []);
    return { rewrite };
}
