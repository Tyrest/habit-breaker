

// Function to display the list of websites in the popup
function displayWebsitesList() {
    // Call the function to retrieve the list of websites
    getWebsitesList(function (websites) {
        // Get the table body element
        const tableBody = document.getElementById('websitesList');

        // Clear any existing rows
        tableBody.innerHTML = '';

        // Add each website to the table
        websites.forEach(function (website) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            cell.textContent = website;
        });
    });
}

// Function to handle click event of the clear button
function handleClearButtonClick() {
    // Set the websites list to an empty array
    chrome.storage.local.set({ 'websites': [] });
    displayWebsitesList();
}

// Function to handle click event of the add button
function handleAddButtonClick() {
    // Get the current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentUrl = tabs[0].url;
        // Get only the domain name from the URL
        const url = new URL(currentUrl);
        const domain = url.hostname;

        // Add the current URL to the websites list in Chrome Storage
        getWebsitesList(function (websites) {
            if (websites.includes(domain))
                return;
            websites.push(domain)
            chrome.storage.local.set({ 'websites': websites }, function () {
                // Call the function to display updated list
                displayWebsitesList();
            });
        });
    });
}

// Call the function when the popup is opened
displayWebsitesList();

// Add event listener to the buttons
document.getElementById('clearButton').addEventListener('click', handleClearButtonClick);
document.getElementById('addButton').addEventListener('click', handleAddButtonClick);