import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text');

    if (!text) {
        return new NextResponse("Missing text parameter", { status: 400 });
    }

    const apiKey = process.env.ELEVENLAB_KEY;
    if (!apiKey) {
        console.error("ELEVENLAB_KEY is not set in environment variables");
        return new NextResponse("TTS API key not configured", { status: 500 });
    }

    const voiceId = "uh5qBlKfjqFl7XXhFnJi";

    try {
        // Use the non-streaming endpoint for better compatibility with HTML Audio
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: "POST",
            headers: {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": apiKey
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("ElevenLabs error:", response.status, err);
            return new NextResponse(`TTS generation failed: ${err}`, { status: response.status });
        }

        // Read the entire audio buffer and return it as a complete response
        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": audioBuffer.byteLength.toString(),
                "Cache-Control": "no-cache",
            }
        });
    } catch (e) {
        console.error("API route TTS error:", e);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
