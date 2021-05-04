let shift = false;

function initializePreventCtrlW() {
  if (!window._preventCtrlW) {
    window._preventCtrlW = true;

    let isDown = false;

    window.addEventListener("keyup", (e) => {
      if (e.key.toLowerCase() == "w") {
        isDown = false;
      }
    });

    chrome.runtime.onMessage.addListener(({ preventCtrlW }) => {
      const { shift } = preventCtrlW;
      const event = new KeyboardEvent("keydown", {
        key: shift ? "W" : "w",
        keyCode: 87,
        which: 87,
        code: "KeyW",
        shiftKey: shift,
        ctrlKey: true,
        repeat: isDown,
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      document.activeElement.dispatchEvent(event);
      isDown = true;
    });
  }
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command == "prevent-close-active" || command == "prevent-close-all") {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab) return;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: initializePreventCtrlW,
    });

    await chrome.tabs.sendMessage(tab.id, {
      preventCtrlW: { shift: command == "prevent-close-all" },
    });
  } else if (command == "close-active" || command == "close-all") {
    const highlightedQuery = {
      highlighted: command == "close-active" ? true : false,
      currentWindow: true,
    };

    const tabs = await chrome.tabs.query(highlightedQuery);
    chrome.tabs.remove(tabs.map((tab) => tab.id));
  }
});
