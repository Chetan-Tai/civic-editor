export type RewriteMode = "happy" | "sad";

export async function rewriteText(text: string, mode: RewriteMode): Promise<string> {
    const resp = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode }),
    });

    const data = (await resp.json()) as { rewritten?: string; error?: string };
    if (!resp.ok || data.error) {
        throw new Error(data.error || `Rewrite failed with ${resp.status}`);
    }
    return data.rewritten ?? "(No rewrite)";
}
