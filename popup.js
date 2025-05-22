document.addEventListener("DOMContentLoaded", () => {
  const checkbox = document.getElementById("enableHumanTyping");
  const stopBtn = document.getElementById("stopTypingBtn");

  chrome.storage.sync.get(["humanTypingEnabled"], (data) => {
    checkbox.checked = !!data.humanTypingEnabled;
  });

  checkbox.addEventListener("change", () => {
    chrome.storage.sync.set({ humanTypingEnabled: checkbox.checked });
  });

  stopBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "STOP_TYPING" });
  });
});
