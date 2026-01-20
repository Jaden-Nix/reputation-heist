// 'use-sound' install failed due to disk space, so we mock this for now to prevent build errors.
export const useHeistSounds = () => {
    const noop = () => { };
    return {
        playStart: noop,
        playJudging: noop,
        stopJudging: noop,
        playVerdict: noop,
        playWinner: noop,
        playLoser: noop,
        playAmbient: noop
    };
};
