document.addEventListener("DOMContentLoaded", () => {
  const enableCheckbox = document.getElementById("enableHumanTyping");
  const stopBtn = document.getElementById("stopTypingBtn");
  const useRandomDelayCheckbox = document.getElementById("useRandomDelay");

  const fixedDelaySlider = document.getElementById("fixedDelay");
  const fixedDelayValue = document.getElementById("fixedDelayValue");

  const minDelaySlider = document.getElementById("minDelay");
  const maxDelaySlider = document.getElementById("maxDelay");
  const minDelayValue = document.getElementById("minDelayValue");
  const maxDelayValue = document.getElementById("maxDelayValue");

  const fixedControls = document.getElementById("fixedDelayControls");
  const randomControls = document.getElementById("randomDelayControls");

  chrome.storage.sync.get(
    ["humanTypingEnabled", "useRandomDelay", "fixedDelay", "minDelay", "maxDelay"],
    (data) => {
      enableCheckbox.checked = !!data.humanTypingEnabled;
      useRandomDelayCheckbox.checked = !!data.useRandomDelay;

      fixedDelaySlider.value = data.fixedDelay ?? 50;
      fixedDelayValue.textContent = fixedDelaySlider.value;

      minDelaySlider.value = data.minDelay ?? 30;
      maxDelaySlider.value = data.maxDelay ?? 100;
      minDelayValue.textContent = minDelaySlider.value;
      maxDelayValue.textContent = maxDelaySlider.value;

      toggleDelayControls();
    }
  );

  enableCheckbox.addEventListener("change", () => {
    chrome.storage.sync.set({ humanTypingEnabled: enableCheckbox.checked });
  });

  useRandomDelayCheckbox.addEventListener("change", () => {
    const checked = useRandomDelayCheckbox.checked;
    chrome.storage.sync.set({ useRandomDelay: checked });
    toggleDelayControls();
  });

  fixedDelaySlider.addEventListener("input", () => {
    fixedDelayValue.textContent = fixedDelaySlider.value;
    chrome.storage.sync.set({ fixedDelay: parseInt(fixedDelaySlider.value) });
  });

  minDelaySlider.addEventListener("input", () => {
    minDelayValue.textContent = minDelaySlider.value;
    chrome.storage.sync.set({ minDelay: parseInt(minDelaySlider.value) });
  });

  maxDelaySlider.addEventListener("input", () => {
    maxDelayValue.textContent = maxDelaySlider.value;
    chrome.storage.sync.set({ maxDelay: parseInt(maxDelaySlider.value) });
  });

  stopBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "STOP_TYPING" });
  });

  function toggleDelayControls() {
    const random = useRandomDelayCheckbox.checked;
    fixedControls.style.display = random ? "none" : "block";
    randomControls.style.display = random ? "block" : "none";
  }
});
