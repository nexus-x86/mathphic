/**
 * AudioPlayer - Singleton that manages an AudioContext unlocked on first user gesture.
 *
 * The browser blocks audio autoplay. The trick: on the first click/tap anywhere on the
 * page, we resume() the AudioContext. After that, all audio plays freely, even from code
 * that isn't directly inside an event handler (like our script runner).
 */

let ctx: AudioContext | null = null;
let unlocked = false;
let activeSource: AudioBufferSourceNode | null = null;
let activeStopFn: (() => void) | null = null;

function getContext(): AudioContext {
    if (!ctx) {
        ctx = new AudioContext();
    }
    return ctx;
}

/**
 * Call this once on app mount. It registers a one-time click/keydown listener that
 * resumes the AudioContext. After the user's first interaction, audio will play freely.
 */
export function unlockAudioOnInteraction() {
    if (typeof window === 'undefined') return;

    const unlock = async () => {
        if (unlocked) return;
        const context = getContext();
        if (context.state === 'suspended') {
            await context.resume();
        }
        unlocked = true;
        // Clean up listeners after unlock
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    window.addEventListener('keydown', unlock);
}

/**
 * Fetches a TTS audio URL and plays it via AudioContext. Returns a Promise that
 * resolves when the audio finishes (or on error). Blocks mid-playback correctly.
 */
export async function playTTS(url: string): Promise<void> {
    const context = getContext();

    // Resume if suspended (e.g. first interaction already happened but context lazy-suspended)
    if (context.state === 'suspended') {
        try { await context.resume(); } catch (_) { }
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`TTS fetch failed: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);

    return new Promise<void>((resolve) => {
        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);

        activeSource = source;
        activeStopFn = () => {
            try { source.stop(); } catch (_) { }
            resolve();
        };

        source.onended = () => {
            if (activeSource === source) activeSource = null;
            if (activeStopFn === activeStopFn) activeStopFn = null;
            resolve();
        };

        source.start(0);
    });
}

/**
 * Immediately stops the currently playing TTS audio (if any).
 */
export function stopCurrentAudio() {
    if (activeStopFn) {
        const fn = activeStopFn;
        activeSource = null;
        activeStopFn = null;
        fn();
    }
}
