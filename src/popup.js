document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const mainView = document.getElementById('mainView');
    const flitsView = document.getElementById('flitsView');
    const selectedWebsiteSpan = document.getElementById('selectedWebsite');
    const websiteTableBody = document.getElementById('websitesList');
    const flitTableBody = document.getElementById('flitsList');

    // Function to show main view (websites list)
    function showMainView() {
        mainView.style.display = 'block';
        flitsView.style.display = 'none';
    }

    // Function to show flits view (flits for selected website)
    function showFlitsView(website) {
        console.debug("showFlitsView(): ", website);
        mainView.style.display = 'none';
        flitsView.style.display = 'block';
        selectedWebsiteSpan.textContent = website;
        flitTableBody.innerHTML = '';

        // Fetch and display flits for the selected website
        getFlitsForWebsite(website, function (flitsForWebsite) {
            flitsForWebsite.forEach(flit => {
                const row = flitTableBody.insertRow();
                const flitCell = row.insertCell();
                const timeCell = row.insertCell();
                flitCell.textContent = flit.flit;
                timeCell.textContent = new Date(flit.time).toLocaleString();
                const deleteCell = row.insertCell();
                deleteCell.classList.add('table-button');
                deleteCell.innerHTML = '<i class="fas fa-times"></i>';
                deleteCell.classList.add('delete-button');
                deleteCell.addEventListener('click', function () {
                    deleteFlit(website, flit.flit, function () {
                        showFlitsView(website);
                    });
                });
            });
        });
    }

    // Function to populate websites list
    function populateWebsitesTable() {
        getWebsites(function (websites) {
            // Clear any existing rows
            websiteTableBody.innerHTML = '';

            // Add each website to the table
            websites.forEach(function (website) {
                const row = websiteTableBody.insertRow();
                const cell = row.insertCell();
                cell.textContent = website;
                cell.addEventListener('click', function () {
                    showFlitsView(website);
                });
                const deleteCell = row.insertCell();
                deleteCell.classList.add('table-button');
                deleteCell.innerHTML = '<i class="fas fa-times"></i>';
                deleteCell.classList.add('delete-button');
                deleteCell.addEventListener('click', function (event) {
                    console.debug("Delete button clicked")
                    event.stopPropagation();
                    deleteWebsite(website, function () {
                        populateWebsitesTable();
                    });
                });
            });
        });
    }

    // Function to handle click event of the add button
    function handleAddButtonClick() {
        // Get the current tab URL
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentUrl = tabs[0].url;
            // Get only the domain name from the URL
            const url = new URL(currentUrl);
            const domain = url.hostname;

            addWebsite(domain, function () {
                populateWebsitesTable();
            });
        });
    }

    // Function to handle click event of the clear button
    function handleClearButtonClick() {
        if (confirm("Are you sure you want to clear the websites list?")) {
            deleteAllWebsites(function () {
                populateWebsitesTable();
            });
        }
    }

    function handleFlitClearButtonClick() {
        if (confirm("Are you sure you want to clear the flits list?")) {
            deleteFlitsForWebsite(selectedWebsiteSpan.textContent, function () {
                showFlitsView(selectedWebsiteSpan.textContent);
            });
        }
    }

    // Populate websites list on popup open
    populateWebsitesTable();

    // Add event listener for "add" and "clear" button
    document.getElementById('addButton').addEventListener('click', handleAddButtonClick);
    document.getElementById('clearButton').addEventListener('click', handleClearButtonClick);
    document.getElementById('flitClearButton').addEventListener('click', handleFlitClearButtonClick);

    // Event listener for "back" button (return to main view)
    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', showMainView);
});