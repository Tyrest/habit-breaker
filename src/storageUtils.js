function getWebsites(callback) {
    chrome.storage.local.get('websites', function (result) {
        let websites = result.websites;

        // If the list doesn't exist, initialize it with the default list
        if (websites === undefined) {
            websites = ['https://www.youtube.com/'];
            // Store the default list in Chrome Storage
            chrome.storage.local.set({ 'websites': websites });
        }

        // Call the callback function with the retrieved or initialized list
        callback(websites || []);
    });
}

function addWebsite(website, callback) {
    getWebsites(function (websites) {
        if (websites.includes(website))
            return;
        websites.push(website);
        chrome.storage.local.set({ 'websites': websites }, function () {
            callback();
        });
    });
}

function deleteWebsite(website, callback) {
    getWebsites(function (websites) {
        const updatedWebsites = websites.filter(w => w !== website);
        chrome.storage.local.set({ 'websites': updatedWebsites }, function () {
            callback();
        });
    });
}

function deleteAllWebsites(callback) {
    chrome.storage.local.set({ 'websites': [] }, function () {
        callback();
    });
}

function getFlits(callback) {
    chrome.storage.local.get('flits', function (result) {
        let flits = result.flits;

        // If the list doesn't exist, initialize it with an empty object
        if (flits === undefined) {
            flits = [];
            // Store the default list in Chrome Storage
            chrome.storage.local.set({ 'flits': flits });
        }

        // Call the callback function with the retrieved or initialized list
        callback(flits || []);
    });
}

function getFlitsForWebsite(website, callback) {
    getFlits(function (flits) {
        console.debug("getFlitsForWebsite(): ", flits);
        const websiteEntry = flits.find(entry => entry.website === website);
        const flitsForWebsite = websiteEntry && websiteEntry.flits ? websiteEntry.flits : [];
        callback(flitsForWebsite);
    });
}

function deleteFlit(website, flit, callback) {
    getFlits(function (flits) {
        const websiteEntry = flits.find(entry => entry.website === website);
        if (websiteEntry) {
            websiteEntry.flits = websiteEntry.flits.filter(f => f.flit !== flit);
            chrome.storage.local.set({ 'flits': flits }, function () {
                callback();
            });
        }
    });
}

function deleteFlitsForWebsite(website, callback) {
    getFlits(function (flits) {
        const updatedFlits = flits.filter(entry => entry.website !== website);
        chrome.storage.local.set({ 'flits': updatedFlits }, function () {
            callback();
        });
    });
}