console.log("On the website: " + window.location.href);

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

// Check if the list of websites exists in Chrome Storage
getStorageAPI().get('websites', function (result) {
    const websites = result.websites || [];
    console.log("Websites list: " + websites);

    // Check if the current website matches any URL from the list
    if (websites.includes(window.location.hostname)) {
        console.log("Website is in the list");
        showOverlay();
    }
});

function showOverlay() {
    // console.debug("showOverlay()");

    // Create a new style for the input-error class that shakes the text box
    const style = document.createElement('style');
    style.textContent = `
        .hb-input-error {
            position: relative;
            animation: hb-shake .1s linear;
            animation-iteration-count: 3;
        }
        @keyframes hb-shake {
            0% { left: -2px; }
            100% { right: -2px; }
        }
    `;
    document.head.appendChild(style);

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

    function handleFlitSubmit() {
        // Get the value of the text box
        const inputValue = textBox.value.trim();

        // Check if the text box is not empty
        if (inputValue !== '' && inputValue !== 'Oops! The textbox is lonely...') {
            // Save the flit in the flit dictionary
            saveFlit(inputValue);
            // Remove overlay
            overlay.remove();
        } else {
            // Check if the text box is not focused
            if (document.activeElement !== textBox) {
                // Show error message in the text box
                textBox.value = 'Oops! The textbox is lonely...';
                textBox.style.color = 'red';
                textBox.addEventListener('focus', function () {
                    // Clear the error message when the user focuses on the text box again
                    textBox.value = '';
                    textBox.style.color = 'initial';
                }, { once: true });
            }
            // Add the class input-error to the text box for 0.3 seconds to shake it
            textBox.classList.add('hb-input-error');
            setTimeout(() => {
                textBox.classList.remove('hb-input-error');
            }, 300);
        }
    }

    // Add event listener for key press
    textBox.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            handleFlitSubmit();
        }
    });

    // Add submit button click event listener
    submitButton.addEventListener('click', handleFlitSubmit);

    // Append text input and submit button to form container
    formContainer.appendChild(textBox);
    formContainer.appendChild(submitButton);

    // Append form container to overlay
    overlay.appendChild(formContainer);

    // Append overlay to body
    document.body.appendChild(overlay);

    // Focus on the text box
    textBox.focus();
}

// Appends the time and flit to the flit dictionary in storage
function saveFlit(flit) {
    // console.debug("Saving flit: ", flit);

    getStorageAPI().get('flits', function (result) {
        const flits = result.flits || [];
        const currentWebsite = window.location.hostname;
        const websiteEntry = flits.find(entry => entry.website === currentWebsite);
        if (websiteEntry) {
            // console.debug("Adding new flit to existing entry in flit dictionary");
            websiteEntry.flits.push({ flit, time: new Date().toISOString() });
            getStorageAPI().set({ 'flits': flits });
        } else {
            // console.debug("Creating new entry in flit dictionary");
            flits.push({ website: currentWebsite, flits: [{ flit, time: new Date().toISOString() }] });
            getStorageAPI().set({ 'flits': flits });
        }
    });
}

