"use client";

import { useEffect } from "react";
import { unlockAudioOnInteraction } from "../lib/AudioPlayer";

/**
 * Drop this component anywhere in the layout tree.
 * It registers event listeners that resume the AudioContext on the first
 * user gesture (click / tap / keydown), permanently unblocking audio.
 */
export default function AudioUnlocker() {
    useEffect(() => {
        unlockAudioOnInteraction();
    }, []);

    return null;
}
