function getStorageAPI() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome') && userAgent.includes('mozilla')) {
        console.debug("Chrome Storage API found")
        return chrome.storage.local;
    } else if (userAgent.includes('firefox')) {
        console.debug("Firefox Storage API found")
        return browser.storage.local;
    } else {
        console.error('Storage API not found. Extension may not be compatible with this browser.');
        return null;
    }
}

function getWebsites(callback) {
    getStorageAPI().get('websites', function (result) {
        let websites = result.websites;

        // If the list doesn't exist, initialize it with the default list
        if (websites === undefined) {
            websites = ['www.youtube.com'];
            // Store the default list in Chrome Storage
            getStorageAPI().set({ 'websites': websites });
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
        getStorageAPI().set({ 'websites': websites }, function () {
            callback();
        });
    });
}

function deleteWebsite(website, callback) {
    getWebsites(function (websites) {
        const updatedWebsites = websites.filter(w => w !== website);
        getStorageAPI().set({ 'websites': updatedWebsites }, function () {
            callback();
        });
    });
}

function deleteAllWebsites(callback) {
    getStorageAPI().set({ 'websites': [] }, function () {
        callback();
    });
}

function getFlits(callback) {
    getStorageAPI().get('flits', function (result) {
        let flits = result.flits;

        // If the list doesn't exist, initialize it with an empty object
        if (flits === undefined) {
            flits = [];
            // Store the default list in Chrome Storage
            getStorageAPI().set({ 'flits': flits });
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
            getStorageAPI().set({ 'flits': flits }, function () {
                callback();
            });
        }
    });
}

function deleteFlitsForWebsite(website, callback) {
    getFlits(function (flits) {
        const updatedFlits = flits.filter(entry => entry.website !== website);
        getStorageAPI().set({ 'flits': updatedFlits }, function () {
            callback();
        });
    });
}