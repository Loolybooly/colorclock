import { state, initializeClock, stopClock, updateDateClock } from './clock.js';

function startRainbow() {
    state.isRainbowActive = true;
    const socialsBtn = document.getElementById("socials-btn");
    let hue = 0;
    state.rainbowInterval = setInterval(() => {
        hue = (hue + 1) % 360;
        socialsBtn.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
    }, 10);
}

function stopRainbow() {
    state.isRainbowActive = false;
    clearInterval(state.rainbowInterval);
    const hexColor = document.getElementById("hex").textContent;
    document.getElementById("socials-btn").style.backgroundColor = hexColor;
}

function populateTimezones() {
    const timezoneSelect = document.getElementById("timezone-select");
    const timezones = Intl.supportedValuesOf("timeZone");

    timezones.forEach((tz) => {
        const option = document.createElement("option");
        option.value = tz;
        option.textContent = tz.replace(/_/g, " ");
        if (tz === state.originalTimezone) {
            option.selected = true;
        }
        timezoneSelect.appendChild(option);
    });
}

function setupEventListeners(colorWheel) {
    const modal = document.getElementById("feature-modal");
    const hexElement = document.getElementById("hex");
    const closeModalBtn = document.getElementById("close-modal");
    const setHexBtn = document.getElementById("set-hex-btn");
    const manualHexInput = document.getElementById("manual-hex-input");
    const resetClockBtn = document.getElementById("reset-clock-btn");
    const dateModeBtn = document.getElementById("date-mode-btn");
    const invertModeBtn = document.getElementById("invert-mode-btn");
    const reverseModeBtn = document.getElementById("reverse-mode-btn");
    const timezoneSelect = document.getElementById("timezone-select");
    const resetTimezoneBtn = document.getElementById("reset-timezone-btn");
    const socialsBtn = document.getElementById("socials-btn");

    socialsBtn.addEventListener("mouseenter", startRainbow);
    socialsBtn.addEventListener("mouseleave", stopRainbow);

    function blurInputs() {
        if (
            document.activeElement === manualHexInput ||
            document.activeElement === timezoneSelect
        ) {
            document.activeElement.blur();
        }
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) {
            modal.classList.add("hidden");
            blurInputs();
        }

        if (
            document.activeElement !== manualHexInput &&
            document.activeElement !== timezoneSelect
        ) {
            const key = e.key.toLowerCase();
            if (key === "h") {
                resetClockBtn.click();
            } else if (key === "j") {
                dateModeBtn.click();
            } else if (key === "k") {
                invertModeBtn.click();
            } else if (key === "l") {
                reverseModeBtn.click();
            }
        }
    });

    hexElement.addEventListener("click", () => {
        state.isSyncing = true;
        colorWheel.hex = document.getElementById("hex").textContent;
        state.isSyncing = false;
        modal.classList.remove("hidden");
    });

    closeModalBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        blurInputs();
    });

    setHexBtn.addEventListener("click", () => {
        let hexValue = manualHexInput.value.trim();
        if (!hexValue.startsWith("#")) {
            hexValue = "#" + hexValue;
        }
        manualHexInput.value = hexValue;
        const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hexValue);

        if (isValidHex) {
            stopClock();
            state.isDateMode = false;
            document.body.style.backgroundColor = hexValue;
            document.getElementById("hex").textContent = hexValue;
            if (!state.isRainbowActive) {
                document.getElementById("socials-btn").style.backgroundColor = hexValue;
            }
            modal.classList.add("hidden");
            blurInputs();
        } else {
            alert("Please enter a valid hex code (e.g., #RRGGBB)");
        }
    });

    resetClockBtn.addEventListener("click", () => {
        const selectedTimezone = timezoneSelect.value;
        state.currentMode = "normal";
        initializeClock(selectedTimezone);
        modal.classList.add("hidden");
        blurInputs();
    });

    dateModeBtn.addEventListener("click", () => {
        stopClock();
        state.isDateMode = true;
        state.currentMode = "normal";
        updateDateClock();
        modal.classList.add("hidden");
        blurInputs();
    });

    invertModeBtn.addEventListener("click", () => {
        state.currentMode = "inverted";
        if (state.isDateMode) {
            updateDateClock();
        } else {
            const selectedTimezone = timezoneSelect.value;
            initializeClock(selectedTimezone);
        }
        modal.classList.add("hidden");
        blurInputs();
    });

    reverseModeBtn.addEventListener("click", () => {
        state.currentMode = "reversed";
        if (state.isDateMode) {
            updateDateClock();
        } else {
            const selectedTimezone = timezoneSelect.value;
            initializeClock(selectedTimezone);
        }
        modal.classList.add("hidden");
        blurInputs();
    });

    timezoneSelect.addEventListener("change", () => {
        const selectedTimezone = timezoneSelect.value;
        initializeClock(selectedTimezone);
    });

    resetTimezoneBtn.addEventListener("click", () => {
        timezoneSelect.value = state.originalTimezone;
        initializeClock(state.originalTimezone);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    populateTimezones();
    initializeClock(state.originalTimezone);

    const colorWheel = new ReinventedColorWheel({
        appendTo: document.getElementById("color-wheel-container"),
        hex: document.getElementById("hex").textContent,
        onChange: (color) => {
             if (!state.isInitializing && !state.isSyncing) {
                 stopClock();
             }
             const hexValue = color.hex;
             state.isDateMode = false;
             document.body.style.backgroundColor = hexValue;
             document.getElementById("hex").textContent = hexValue;
             if (!state.isRainbowActive) {
                const socialsBtn = document.getElementById("socials-btn");
                if (socialsBtn) {
                     socialsBtn.style.backgroundColor = hexValue;
                }
             }
        },
    });

    setupEventListeners(colorWheel);

    if (document.getElementById("hex").textContent) {
        colorWheel.hex = document.getElementById("hex").textContent;
    }

    state.isInitializing = false;
});
