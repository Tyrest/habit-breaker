chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message && message.message === "show_popup") {
        console.log("Received a message to show the popup");
    }
});
