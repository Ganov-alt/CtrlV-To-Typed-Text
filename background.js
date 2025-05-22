chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "STOP_TYPING") {
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { type: "STOP_TYPING" });
      }
    });
  }
});
