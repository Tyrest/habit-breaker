// ============================================================================
// Habit Breaker Content Script
// ============================================================================

console.log("On the website: " + window.location.href);

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the appropriate storage API for the current browser
 */
function getStorageAPI() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome') && userAgent.includes('mozilla')) {
        return chrome.storage.local;
    } else if (userAgent.includes('firefox')) {
        return browser.storage.local;
    } else {
        console.error('Storage API not found. Extension may not be compatible with this browser.');
        return null;
    }
}

/**
 * Save a flit (reason for visiting) to storage
 */
function saveFlit(flit) {
    getStorageAPI().get('flits', function (result) {
        const flits = result.flits || [];
        const currentWebsite = window.location.hostname;
        const websiteEntry = flits.find(entry => entry.website === currentWebsite);
        
        if (websiteEntry) {
            websiteEntry.flits.push({ flit, time: new Date().toISOString() });
        } else {
            flits.push({ website: currentWebsite, flits: [{ flit, time: new Date().toISOString() }] });
        }
        
        getStorageAPI().set({ 'flits': flits });
    });
}

// ============================================================================
// CSS Styles
// ============================================================================

/**
 * Inject CSS link for animations and UI elements
 */
function injectStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('content.css');
    document.head.appendChild(link);
}

// ============================================================================
// DOM Element Creation
// ============================================================================

/**
 * Create the main overlay element
 */
function createOverlay() {
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
    overlay.style.backdropFilter = 'blur(25px)';
    return overlay;
}

/**
 * Create the form container with input and submit button
 */
function createFormContainer() {
    const formContainer = document.createElement('div');
    formContainer.style.position = 'absolute';
    formContainer.style.backgroundColor = '#fff';
    formContainer.style.padding = '20px';
    formContainer.style.borderRadius = '10px';
    formContainer.style.display = 'none';
    return formContainer;
}

/**
 * Create the text input field
 */
function createTextInput() {
    const textBox = document.createElement('input');
    textBox.type = 'text';
    textBox.placeholder = 'What led you here...';
    textBox.style.width = '200px';
    textBox.style.marginRight = '10px';
    textBox.style.color = '#000';
    return textBox;
}

/**
 * Create the submit button
 */
function createSubmitButton() {
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.style.padding = '10px 20px';
    submitButton.style.backgroundColor = '#ff6347';
    submitButton.style.color = '#fff';
    submitButton.style.border = 'none';
    submitButton.style.borderRadius = '5px';
    submitButton.style.cursor = 'pointer';
    return submitButton;
}

/**
 * Create the strict mode title text
 */
function createStrictModeTitle() {
    const titleText = document.createElement('h1');
    titleText.style.display = 'none';
    titleText.style.position = 'absolute';
    titleText.textContent = 'Strict Mode';
    titleText.style.color = '#FFF';
    titleText.style.fontSize = '128px';
    titleText.style.marginBottom = '20px';
    return titleText;
}

/**
 * Create the breathing animation elements
 */
function createBreathingAnimation() {
    const breathingContainer = document.createElement('div');
    breathingContainer.className = 'hb-breathing-container';
    
    const breathingCircle = document.createElement('div');
    breathingCircle.className = 'hb-breathing-circle';
    
    const breathingText = document.createElement('div');
    breathingText.className = 'hb-breathing-text';
    breathingText.textContent = 'Breathe In';
    
    // Change text at the right moment
    setTimeout(() => {
        breathingText.textContent = 'Breathe Out';
    }, 3600);
    
    breathingContainer.appendChild(breathingCircle);
    breathingContainer.appendChild(breathingText);
    
    return breathingContainer;
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle input validation and error display
 */
function handleInputError(textBox) {
    if (document.activeElement !== textBox) {
        textBox.value = 'Oops! The textbox is lonely...';
        textBox.style.color = 'red';
        textBox.addEventListener('focus', function () {
            textBox.value = '';
            textBox.style.color = 'initial';
        }, { once: true });
    }
    
    textBox.classList.add('hb-input-error');
    setTimeout(() => {
        textBox.classList.remove('hb-input-error');
    }, 300);
}

/**
 * Handle the overlay display based on mode
 */
function showOverlay() {
    injectStyles();
    
    const overlay = createOverlay();
    const formContainer = createFormContainer();
    const textBox = createTextInput();
    const submitButton = createSubmitButton();
    const titleText = createStrictModeTitle();
    
    // Handle strict mode display
    function handleStrictMode() {
        formContainer.remove();
        titleText.style.display = 'block';
    }
    
    // Handle flit submission
    function handleFlitSubmit() {
        const inputValue = textBox.value.trim();
        
        if (inputValue !== '' && inputValue !== 'Oops! The textbox is lonely...') {
            saveFlit(inputValue);
            
            getStorageAPI().get('websites', function (result) {
                const websites = result.websites || [];
                const currentWebsite = window.location.hostname;
                const websiteEntry = websites.find(entry => currentWebsite.includes(entry.website));
                const mode = websiteEntry && websiteEntry.mode ? websiteEntry.mode : 'default';
                
                if (mode === 'strict') {
                    handleStrictMode();
                } else {
                    overlay.classList.add('hb-fade-out');
                    setTimeout(() => overlay.remove(), 500);
                }
            });
        } else {
            handleInputError(textBox);
        }
    }
    
    // Add event listeners
    textBox.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            handleFlitSubmit();
        }
    });
    submitButton.addEventListener('click', handleFlitSubmit);
    
    // Build form
    formContainer.appendChild(textBox);
    formContainer.appendChild(submitButton);
    overlay.appendChild(titleText);
    overlay.appendChild(formContainer);
    document.body.appendChild(overlay);
    
    // Initialize based on mode
    initializeOverlayByMode(overlay, formContainer, textBox);
}

/**
 * Initialize overlay behavior based on website mode
 */
function initializeOverlayByMode(overlay, formContainer, textBox) {
    getStorageAPI().get('websites', function (result) {
        const websites = result.websites || [];
        const currentWebsite = window.location.hostname;
        const websiteEntry = websites.find(entry => currentWebsite.includes(entry.website));
        const mode = websiteEntry && websiteEntry.mode ? websiteEntry.mode : 'default';
        
        if (mode === 'relaxed') {
            // Show form immediately in relaxed mode
            formContainer.style.display = 'block';
            textBox.focus();
        } else {
            // Show breathing animation first in default/strict mode
            const breathingContainer = createBreathingAnimation();
            overlay.appendChild(breathingContainer);
            
            setTimeout(() => {
                breathingContainer.remove();
                formContainer.style.display = 'block';
                textBox.focus();
            }, 8000);
        }
    });
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Check if current website is in the monitored list and show overlay if needed
 */
function init() {
    getStorageAPI().get('websites', function (result) {
        const websites = result.websites || [];
        const websiteEntry = websites.find(entry => window.location.hostname.includes(entry.website));
        
        if (websiteEntry) {
            showOverlay();
        }
    });
}

// Start the extension
init();