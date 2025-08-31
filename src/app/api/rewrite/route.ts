import { NextResponse } from "next/server";

function buildPrompt(text: string, mode: "happy" | "sad") {
    const instruction =
        mode === "happy"
        ? "Rewrite this to sound positive, upbeat, and encouraging while preserving the meaning. Return ONLY the rewritten sentence without quotes."
        : "Rewrite this to sound negative/pessimistic while preserving the meaning. Return ONLY the rewritten sentence without quotes.";
    return `${instruction}\n\nSentence: """${text}"""\n\nRewritten:`;
}

export async function POST(req: Request) {
    try {
        const { text, mode } = (await req.json()) as {
        text: string;
        mode: "happy" | "sad";
        };

        if (!text || (mode !== "happy" && mode !== "sad")) {
        return NextResponse.json(
            { error: "Invalid payload. Expect { text, mode: 'happy'|'sad' }." },
            { status: 400 }
        );
        }

        const apiKey = process.env.OPENAI_API_KEY;

        // Fallback demo if no key: still “works” so you can test end-to-end
        if (!apiKey) {
        const rewritten =
            mode === "happy"
            ? `😊 ${text} — This actually sounds wonderful when you think about it!`
            : `☁️ ${text} — Honestly, it’s not great and could get worse.`;
        return NextResponse.json({ rewritten });
        }

        // Real provider call (OpenAI example — replace model if you want)
        const prompt = buildPrompt(text, mode);

        const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
            { role: "system", content: "You rewrite user text as requested, concisely." },
            { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 200,
        }),
        });

        if (!resp.ok) {
        const err = await resp.text().catch(() => "");
        return NextResponse.json({ error: `Provider error: ${resp.status} ${err}` }, { status: 502 });
        }

        const data = await resp.json();
        const rewritten = data?.choices?.[0]?.message?.content?.trim() ?? "(No rewrite returned.)";
        return NextResponse.json({ rewritten });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? "Unexpected error" }, { status: 500 });
    }
}