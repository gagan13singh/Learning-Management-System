import { useEffect, useState, useCallback } from 'react';

const useProctoring = (enabled = true, onViolation) => {
    const [warningCount, setWarningCount] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(document.fullscreenElement !== null);

    // 1. Fullscreen Enforcement
    const enterFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
        } catch (err) {
            console.error("Fullscreen Request Failed:", err);
        }
    }, []);

    const handleFullscreenChange = useCallback(() => {
        const isFS = document.fullscreenElement !== null;
        setIsFullscreen(isFS);
        if (!isFS && enabled) {
            handleViolation("FULLSCREEN_EXIT", "User exited fullscreen mode");
        }
    }, [enabled]);

    // 2. Tab Switch / Focus Loss
    const handleVisibilityChange = useCallback(() => {
        if (document.hidden && enabled) {
            handleViolation("TAB_SWITCH", "User switched tabs or minimized window");
        }
    }, [enabled]);

    const handleWindowBlur = useCallback(() => {
        if (enabled) {
            // Optional: Some browsers fire blur even on legitimate interactions, use carefully.
            // handleViolation("FOCUS_LOST", "Window lost focus");
        }
    }, [enabled]);

    // 3. Prevent Copy-Paste
    const preventCopyPaste = useCallback((e) => {
        if (enabled) {
            e.preventDefault();
            // Optional: warning toast
        }
    }, [enabled]);

    // Central Violation Handler
    const handleViolation = (type, evidence) => {
        setWarningCount(prev => prev + 1);
        if (onViolation) {
            onViolation(type, evidence);
        }
    };

    useEffect(() => {
        if (!enabled) return;

        // Listeners
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('contextmenu', preventCopyPaste);
        document.addEventListener('copy', preventCopyPaste);
        document.addEventListener('paste', preventCopyPaste);
        document.addEventListener('cut', preventCopyPaste);

        // Initial Fullscreen Request (User interaction required usually, called via button)

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('contextmenu', preventCopyPaste);
            document.removeEventListener('copy', preventCopyPaste);
            document.removeEventListener('paste', preventCopyPaste);
            document.removeEventListener('cut', preventCopyPaste);
        };
    }, [enabled, handleFullscreenChange, handleVisibilityChange, handleWindowBlur, preventCopyPaste]);

    return {
        enterFullscreen,
        isFullscreen,
        warningCount
    };
};

export default useProctoring;
