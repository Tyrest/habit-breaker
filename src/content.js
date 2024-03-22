console.log("On the website: " + window.location.href);

// Check if the list of websites exists in Chrome Storage
chrome.storage.local.get('websites', function (result) {
    const websites = result.websites || [];
    console.log("Websites list: " + websites);

    // Check if the current website matches any URL from the list
    if (websites.includes(window.location.hostname)) {
        console.log("Website is in the list");
        // Send a message to the background script to show the popup
        // chrome.runtime.sendMessage({ message: "show_popup" });
        showOverlay();
    }
});

function showOverlay() {
    // console.debug("showOverlay()");

    // Create overlay div
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.backdropFilter = 'blur(5px)';

    // Create form container
    const formContainer = document.createElement('div');
    formContainer.style.backgroundColor = '#fff';
    formContainer.style.padding = '20px';
    formContainer.style.borderRadius = '10px';

    // Create text input
    const textBox = document.createElement('input');
    textBox.type = 'text';
    textBox.placeholder = 'What led you here...';
    textBox.style.width = '200px';
    textBox.style.marginRight = '10px';

    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.style.padding = '10px 20px';
    submitButton.style.backgroundColor = '#ff6347';
    submitButton.style.color = '#fff';
    submitButton.style.border = 'none';
    submitButton.style.borderRadius = '5px';
    submitButton.style.cursor = 'pointer';

    // Add submit button click event listener
    submitButton.addEventListener('click', function () {
        // Get the value of the text box
        const inputValue = textBox.value.trim();

        // Check if the text box is not empty
        if (inputValue !== '') {
            // Save the flit in the flit dictionary
            saveFlit(inputValue);
            // Remove overlay
            overlay.remove();
        } else {
            // Show error message in the text box
            textBox.value = 'Oops! The textbox is lonely...';
            textBox.style.color = 'red';
            textBox.addEventListener('focus', function () {
                // Clear the error message when the user focuses on the text box again
                textBox.value = '';
                textBox.style.color = 'initial';
            }, { once: true });
        }
    });

    // Append text input and submit button to form container
    formContainer.appendChild(textBox);
    formContainer.appendChild(submitButton);

    // Append form container to overlay
    overlay.appendChild(formContainer);

    // Append overlay to body
    document.body.appendChild(overlay);
}

// Appends the time and flit to the flit dictionary in storage
function saveFlit(flit) {
    // console.debug("Saving flit: ", flit);

    chrome.storage.local.get('flits', function (result) {
        const flits = result.flits || [];
        const currentWebsite = window.location.hostname;
        const websiteEntry = flits.find(entry => entry.website === currentWebsite);
        if (websiteEntry) {
            // console.debug("Adding new flit to existing entry in flit dictionary");
            websiteEntry.flits.push({ flit, time: new Date().toISOString() });
            chrome.storage.local.set({ 'flits': flits });
        } else {
            // console.debug("Creating new entry in flit dictionary");
            flits.push({ website: currentWebsite, flits: [{ flit, time: new Date().toISOString() }] });
            chrome.storage.local.set({ 'flits': flits });
        }
        // console.debug("flits: ", flits);
    });
}

