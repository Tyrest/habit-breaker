console.log("On the website: " + window.location.href);

// Check if the list of websites exists in Chrome Storage
chrome.storage.local.get('websites', function (result) {
    const websites = result.websites || [];
    console.log("Websites list: " + websites);

    // Check if the current website matches any URL from the list
    if (websites.includes(window.location.hostname)) {
        console.log("Website is in the list");
        // Send a message to the background script to show the popup
        chrome.runtime.sendMessage({ message: "show_popup" });
    }
});
