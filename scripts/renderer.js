// SOURCE:
// https://github.com/binaryfunt/electron-seamless-titlebar-tutorial

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require("electron");
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;

/** Handles font size changes */
ipcRenderer.on("font-size", function (event, message) {

    const container = document.getElementsByClassName("ql-container")[0];

    let fontSize = parseFloat(window.getComputedStyle(container, null).getPropertyValue('font-size'));
    let delta = message ? 2 : -2;

    container.style.fontSize = `${fontSize + delta}px`;

    console.log(`should have happened with ${delta} change`);
});

/** Toggles markdown auto-conversion */
// ipcRenderer.on("toggle-markdown", function (event) {
//     MARKDOWN = !MARKDOWN;
// });


(function handleWindowControls() {
    // When document has loaded, initialise
    document.onreadystatechange = () => {
        if (document.readyState == "complete") {
            init();
        }
    };

    function init() {
        let window = remote.getCurrentWindow();
        const minButton = document.getElementById('min-button'),
            maxButton = document.getElementById('max-button'),
            restoreButton = document.getElementById('restore-button'),
            closeButton = document.getElementById('close-button');

        minButton.addEventListener("click", event => {
            window = remote.getCurrentWindow();
            window.minimize();
        });

        maxButton.addEventListener("click", event => {
            window = remote.getCurrentWindow();
            window.maximize();
            toggleMaxRestoreButtons();
        });

        restoreButton.addEventListener("click", event => {
            window = remote.getCurrentWindow();
            window.unmaximize();
            toggleMaxRestoreButtons();
        });

        // Toggle maximise/restore buttons when maximisation/unmaximisation
        // occurs by means other than button clicks e.g. double-clicking
        // the title bar:
        toggleMaxRestoreButtons();
        window.on('maximize', toggleMaxRestoreButtons);
        window.on('unmaximize', toggleMaxRestoreButtons);

        closeButton.addEventListener("click", event => {
            window = remote.getCurrentWindow();
            window.close();
        });

        function toggleMaxRestoreButtons() {
            window = remote.getCurrentWindow();
            if (window.isMaximized()) {
                maxButton.style.display = "none";
                restoreButton.style.display = "flex";
            } else {
                restoreButton.style.display = "none";
                maxButton.style.display = "flex";
            }
        }
    }
})();