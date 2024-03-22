// Function to retrieve the list of websites from Chrome Storage
function getWebsitesList(callback) {
    chrome.storage.local.get('websites', function (result) {
        const websites = result.websites || [];
        callback(websites);
    });
}

// Usage of the encapsulated function
getWebsitesList(function (websites) {
    // If the list is empty or doesn't exist, initialize it with the default list
    if (websites === undefined) {
        websites = ['https://www.youtube.com/'];
        // Store the default list in Chrome Storage
        chrome.storage.local.set({ 'websites': websites });
    }
});