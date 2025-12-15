export const state = {
    clockInterval: undefined,
    originalTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isDateMode: false,
    rainbowInterval: undefined,
    isRainbowActive: false,
    currentMode: "normal",
    isSyncing: false,
    isInitializing: true
};

export function transformHex(hex) {
    let cleanHex = hex.replace("#", "");

    if (state.currentMode === "inverted") {
        const r = 255 - parseInt(cleanHex.slice(0, 2), 16);
        const g = 255 - parseInt(cleanHex.slice(2, 4), 16);
        const b = 255 - parseInt(cleanHex.slice(4, 6), 16);

        const rHex = r.toString(16).padStart(2, "0");
        const gHex = g.toString(16).padStart(2, "0");
        const bHex = b.toString(16).padStart(2, "0");

        cleanHex = `${rHex}${gHex}${bHex}`.toUpperCase();
    } else if (state.currentMode === "reversed") {
        cleanHex = cleanHex.split("").reverse().join("").toUpperCase();
    }

    return `#${cleanHex}`;
}

export function updateHexClock(timeZone) {
    const now = new Date();
    let hours, minutes, seconds;

    try {
        const timeString = new Intl.DateTimeFormat("en-US", {
            timeZone: timeZone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }).format(now);

        if (timeString.startsWith("24")) {
            [hours, minutes, seconds] = ["00", ...timeString.split(":").slice(1)];
        } else {
            [hours, minutes, seconds] = timeString.split(":");
        }
    } catch (error) {
        console.error(error);
        hours = String(now.getHours()).padStart(2, "0");
        minutes = String(now.getMinutes()).padStart(2, "0");
        seconds = String(now.getSeconds()).padStart(2, "0");
    }

    const baseHex = `#${hours}${minutes}${seconds}`;
    const hexColor = transformHex(baseHex);

    document.getElementById("hex").textContent = hexColor;
    document.body.style.backgroundColor = hexColor;
    if (!state.isRainbowActive) {
        const socialsBtn = document.getElementById("socials-btn");
        if (socialsBtn) {
             socialsBtn.style.backgroundColor = hexColor;
        }
    }
}

export function updateDateClock() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);

    const baseHex = `#${day}${month}${year}`;
    const hexColor = transformHex(baseHex);

    document.getElementById("hex").textContent = hexColor;
    document.body.style.backgroundColor = hexColor;
    if (!state.isRainbowActive) {
        const socialsBtn = document.getElementById("socials-btn");
        if (socialsBtn) {
             socialsBtn.style.backgroundColor = hexColor;
        }
    }
}

export function stopClock() {
    if (state.clockInterval) {
        clearTimeout(state.clockInterval);
        state.clockInterval = undefined;
    }
}

export function initializeClock(timeZone) {
    stopClock();
    state.isDateMode = false;

    const tick = () => {
        updateHexClock(timeZone);
        const now = new Date();
        const delay = 1000 - now.getMilliseconds();
        state.clockInterval = setTimeout(tick, delay);
    };
    tick();
}
