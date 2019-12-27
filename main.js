const electron = require("electron");
const url = require("url");
const path = require("path");


const { app, BrowserWindow, Menu } = electron;

let win;

// Listen for app ready
app.on("ready", function () {
    // Create the main window
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        frame: false,
        show: false
    });

    win.once('ready-to-show', function () {
        win.show()
    });

    // Load main html file
    win.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));


    // Setting menu
    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);

    // Hiding the menu
    win.setMenuBarVisibility(true);
});

// Additional menu shortcuts
const menuTemplate = [
    {
        label: "File",
        submenu: [
            { label: "New File" },   /** TODO: ADD FILE I/O FUNCTIONALITY */
            { label: "Open File" },
            { label: "Save" },
            {
                label: "quit",
                accelerator: "Ctrl+Q",
                click() {
                    app.exit();
                }
            }
        ]
    },
    {
        label: "View",
        submenu: [
            {
                label: "Reload",
                accelerator: "Ctrl+R",
                click() {
                    win.reload();
                }
            },
            {
                label: "Toggle Dev Tools",
                accelerator: "Ctrl+Shift+I",
                click() {
                    win.toggleDevTools();
                }
            },
            {
                label: "Toggle Fullscreen",
                accelerator: "F11",
                click() {
                    win.setFullScreen(!win.isFullScreen());
                }
            },
            {
                label: "Increase Font Size",
                accelerator: "Ctrl+=",
                click() {
                    increaseFontSize();
                }
            },
            {
                label: "Decrease Font Size",
                accelerator: "Ctrl+-",
                click() {
                    decreaseFontSize();
                }
            },
            // {
            //     label: "Toggle Markdown Conversion",
            //     accelerator: "Ctrl+M",
            //     click() {
            //         toggleMarkdown();
            //     }
            // },
        ]
    },
]

function increaseFontSize() {
    win.webContents.send("font-size", "1");
};

function decreaseFontSize() {
    win.webContents.send("font-size", "");
};

// function toggleMarkdown() {
//     win.webContents.send("toggle-markdown");
// }