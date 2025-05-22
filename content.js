let humanTypingEnabled = false;
let typingAbortController = null;
let typingInProgress = false;

// Load initial state
chrome.storage.sync.get(["humanTypingEnabled"], (data) => {
  humanTypingEnabled = !!data.humanTypingEnabled;
});

// Watch for toggle changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.humanTypingEnabled) {
    humanTypingEnabled = changes.humanTypingEnabled.newValue;
  }
});

// Allow external stop
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "STOP_TYPING") {
    if (typingAbortController) {
      typingAbortController.abort();
      typingAbortController = null;
    }
  }
});

// PASTE INTERCEPTION FIXED
document.addEventListener(
  "paste",
  function (e) {
    if (!humanTypingEnabled) return;

    const active = document.activeElement;
    if (
      active &&
      (active.tagName === "TEXTAREA" ||
        active.tagName === "INPUT" ||
        active.isContentEditable)
    ) {
      // BLOCK default paste fully
      e.preventDefault();
      e.stopImmediatePropagation();

      // Delay to allow browser to pre-paste, then clear it
      requestAnimationFrame(async () => {
        clearSelection(active);

        let clipboardText = "";
        try {
          clipboardText = await navigator.clipboard.readText();
        } catch (err) {
          if (e.clipboardData) {
            clipboardText = e.clipboardData.getData("text/plain");
          }
        }

        if (clipboardText) {
          startTyping(active, clipboardText);
        }
      });
    }
  },
  true // ensure we catch paste before others
);

// Clear selection or pre-inserted text
function clearSelection(el) {
  if (el.isContentEditable) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      selection.deleteFromDocument();
    }
  } else {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end) {
      const value = el.value;
      el.value = value.substring(0, start) + value.substring(end);
      el.selectionStart = el.selectionEnd = start;
    }
  }
}

// Simulate typing text
function startTyping(el, text) {
  if (typingInProgress) return;

  typingInProgress = true;
  typingAbortController = new AbortController();
  const signal = typingAbortController.signal;

  let i = 0;

  function typeNext() {
    if (signal.aborted || !humanTypingEnabled) {
      typingInProgress = false;
      return;
    }

    if (i < text.length) {
      insertChar(el, text[i]);
      i++;
      setTimeout(typeNext, 30 + Math.random() * 100);
    } else {
      typingInProgress = false;
    }
  }

  typeNext();
}

// Insert single character
function insertChar(el, char) {
  if (el.isContentEditable) {
    document.execCommand("insertText", false, char);
  } else {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const value = el.value;

    el.value = value.substring(0, start) + char + value.substring(end);
    el.selectionStart = el.selectionEnd = start + 1;
  }

  el.dispatchEvent(new Event("input", { bubbles: true }));
}
