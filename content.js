let humanTypingEnabled = false;
let typingAbortController = null;
let typingInProgress = false;

chrome.storage.sync.get(["humanTypingEnabled"], (data) => {
  humanTypingEnabled = !!data.humanTypingEnabled;
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.humanTypingEnabled) {
    humanTypingEnabled = changes.humanTypingEnabled.newValue;
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "STOP_TYPING") {
    if (typingAbortController) {
      typingAbortController.abort();
      typingAbortController = null;
    }
  }
});

document.addEventListener("paste", function (e) {
  if (!humanTypingEnabled) return;

  const active = document.activeElement;
  if (
    active &&
    (active.tagName === "TEXTAREA" ||
      active.tagName === "INPUT" ||
      active.isContentEditable)
  ) {
    e.preventDefault();
    e.stopImmediatePropagation();

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
}, true);

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

function startTyping(el, text) {
  if (typingInProgress) return;

  typingInProgress = true;

  chrome.storage.sync.get(
    ["useRandomDelay", "fixedDelay", "minDelay", "maxDelay"],
    (settings) => {
      typingAbortController = new AbortController();
      const signal = typingAbortController.signal;

      const useRandom = !!settings.useRandomDelay;
      const fixed = settings.fixedDelay ?? 50;
      const min = settings.minDelay ?? 30;
      const max = settings.maxDelay ?? 100;

      let i = 0;

      function typeNext() {
        if (signal.aborted || !humanTypingEnabled) {
          typingInProgress = false;
          return;
        }

        if (i < text.length) {
          insertChar(el, text[i]);
          i++;

          const delay = useRandom
            ? Math.floor(Math.random() * (max - min + 1)) + min
            : fixed;

          setTimeout(typeNext, delay);
        } else {
          typingInProgress = false;
        }
      }

      typeNext();
    }
  );
}

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
