let clockInterval;
let originalTimezone;
let isDateMode = false;
let rainbowInterval;
let isRainbowActive = false;

function updateHexClock(timeZone) {
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
    console.error(
      "Invalid time zone specified. Falling back to local time.",
      error,
    );
    hours = String(now.getHours()).padStart(2, "0");
    minutes = String(now.getMinutes()).padStart(2, "0");
    seconds = String(now.getSeconds()).padStart(2, "0");
  }

  const hexColor = `#${hours}${minutes}${seconds}`;

  document.getElementById("hex").textContent = hexColor;
  document.body.style.backgroundColor = hexColor;
  if (!isRainbowActive) {
    document.getElementById("socials-btn").style.backgroundColor = hexColor;
  }
}

function updateDateClock() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);

  const hexColor = `#${day}${month}${year}`;

  document.getElementById("hex").textContent = hexColor;
  document.body.style.backgroundColor = hexColor;
  if (!isRainbowActive) {
    document.getElementById("socials-btn").style.backgroundColor = hexColor;
  }
}

function initializeClock(timeZone) {
  clearInterval(clockInterval);
  isDateMode = false;
  updateHexClock(timeZone);
  clockInterval = setInterval(() => updateHexClock(timeZone), 1000);
}

function populateTimezones() {
  const timezoneSelect = document.getElementById("timezone-select");
  originalTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const timezones = Intl.supportedValuesOf("timeZone");

  timezones.forEach((tz) => {
    const option = document.createElement("option");
    option.value = tz;
    option.textContent = tz.replace(/_/g, " ");
    if (tz === originalTimezone) {
      option.selected = true;
    }
    timezoneSelect.appendChild(option);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  let isInitializing = true;
  const modal = document.getElementById("feature-modal");
  const hexElement = document.getElementById("hex");
  const closeModalBtn = document.getElementById("close-modal");
  const setHexBtn = document.getElementById("set-hex-btn");
  const manualHexInput = document.getElementById("manual-hex-input");
  const resetClockBtn = document.getElementById("reset-clock-btn");
  const dateModeBtn = document.getElementById("date-mode-btn");
  const timezoneSelect = document.getElementById("timezone-select");
  const resetTimezoneBtn = document.getElementById("reset-timezone-btn");
  const socialsBtn = document.getElementById("socials-btn");

  function startRainbow() {
    isRainbowActive = true;
    let hue = 0;
    rainbowInterval = setInterval(() => {
      hue = (hue + 1) % 360;
      socialsBtn.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
    }, 10);
  }

  function stopRainbow() {
    isRainbowActive = false;
    clearInterval(rainbowInterval);
    const hexColor = document.getElementById("hex").textContent;
    socialsBtn.style.backgroundColor = hexColor;
  }

  socialsBtn.addEventListener("mouseenter", startRainbow);

  socialsBtn.addEventListener("mouseleave", stopRainbow);

  const colorWheel = new ReinventedColorWheel({
    appendTo: document.getElementById("color-wheel-container"),
    hex: document.getElementById("hex").textContent,
    onChange: (color) => {
      if (!isInitializing) {
        clearInterval(clockInterval);
      }
      const hexValue = color.hex;
      isDateMode = false;
      document.body.style.backgroundColor = hexValue;
      document.getElementById("hex").textContent = hexValue;
      if (!isRainbowActive) {
        document.getElementById("socials-btn").style.backgroundColor = hexValue;
      }
    },
  });

  hexElement.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  setHexBtn.addEventListener("click", () => {
    const hexValue = manualHexInput.value;
    const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hexValue);

    if (isValidHex) {
      clearInterval(clockInterval);
      isDateMode = false;
      document.body.style.backgroundColor = hexValue;
      document.getElementById("hex").textContent = hexValue;
      if (!isRainbowActive) {
        document.getElementById("socials-btn").style.backgroundColor = hexValue;
      }
      modal.classList.add("hidden");
    } else {
      alert("Please enter a valid hex code (e.g., #RRGGBB)");
    }
  });

  resetClockBtn.addEventListener("click", () => {
    const selectedTimezone = timezoneSelect.value;
    initializeClock(selectedTimezone);
    modal.classList.add("hidden");
  });

  dateModeBtn.addEventListener("click", () => {
    clearInterval(clockInterval);
    isDateMode = true;
    updateDateClock();
    modal.classList.add("hidden");
  });

  timezoneSelect.addEventListener("change", () => {
    const selectedTimezone = timezoneSelect.value;
    initializeClock(selectedTimezone);
  });

  resetTimezoneBtn.addEventListener("click", () => {
    timezoneSelect.value = originalTimezone;
    initializeClock(originalTimezone);
  });

  populateTimezones();
  initializeClock(originalTimezone);
  colorWheel.setHex(document.getElementById("hex").textContent);
  isInitializing = false;
});
