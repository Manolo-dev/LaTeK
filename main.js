// o  burp °  __v____ o °  O o ° o
//  O °  o\  '       \ ° _° o O °
// ° O  ° o | _o      `-'_>  ° o °
//   o ° o   .         .-.> o O °
//  O   o ° o `-------' °  o ° O o

const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const node_con = require("console");
const path = require("path");
const fs = require("fs");
const con = new node_con.Console(process.stdout, process.stderr);

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: __dirname + "/favicon.ico",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, "preload.js")
        }
    });

    win.webContents.openDevTools();

    win.loadFile("index.html");

    const template = [
        {
            label: "File",
            submenu: [
                {
                    label: "Open",
                    accelerator: "CommandOrControl+o",
                    click() {
                        let options = {
                            title: "Open Tex file",

                            properties: ['openFile'],

                            buttonLabel : "Open Tex File",

                            filters :[
                                {name: "Tex File", extensions: ["tex"]},
                                {name: "Text File", extensions: ["text", "txt"]}
                            ]
                        };

                        dialog.showOpenDialog(win, options)
                        .then(result => {
                            win.webContents.send("open-file", result.filePaths);
                        });
                    }
                }, {
                    label: "Import",
                    accelerator: "CommandOrControl+Shift+o",
                    click() {
                        let options = {
                            title: "Open Tex file without clearing",

                            properties: ['openFile'],

                            buttonLabel : "Open Tex File",

                            filters :[
                                {name: "Tex File", extensions: ["tex"]},
                                {name: "Text File", extensions: ["text", "txt"]}
                            ]
                        };

                        dialog.showOpenDialog(win, options)
                        .then(result => {
                            win.webContents.send("import-file", result.filePaths);
                        });
                    }
                }, {
                    label: "Save",
                    accelerator: "CommandOrControl+s",
                    click() {
                        win.webContents.send("save-file");
                    }
                }, {
                    label: "Export",
                    accelerator: "CommandOrControl+e",
                    click() {
                        win.webContents.send("export-image");
                    }
                },
                {type: "separator"},
                {
                    label: "Reload",
                    accelerator: "CommandOrControl+r",
                    click() { win.reload(); }
                }, {
                    label: "Exit",
                    accelerator: "CommandOrControl+q",
                    click() { app.quit(); }
                }
            ]
        }, {
            label: "Edit",
            submenu: [
                {
                    label: "Undo",
                    accelerator: "CommandOrControl+z"
                }, {
                    label: "Redo",
                    accelerator: "CommandOrControl+y"
                },
                {type: "separator"},
                {
                    label: "Cut",
                    accelerator: "CommandOrControl+x",
                    click() { win.webContents.send("cut"); }
                }, {
                    label: "Copy",
                    accelerator: "CommandOrControl+c",
                    click() { win.webContents.send("copy"); }
                }, {
                    label: "Paste",
                    accelerator: "CommandOrControl+v",
                    click() { win.webContents.send("paste"); }
                }
            ]
        },
        {
            label: "View",
            submenu: [
                {
                    label: "Top-Bottom",
                    accelerator: "CommandOrControl+Shift+1",
                    click() { win.webContents.send("view", "top"); }
                }, {
                    label: "Bottom-Top",
                    accelerator: "CommandOrControl+Shift+2",
                    click() { win.webContents.send("view", "bottom"); }
                }, {
                    label: "Left-Right",
                    accelerator: "CommandOrControl+Shift+3",
                    click() { win.webContents.send("view", "left"); }
                }, {
                    label: "Right-Left",
                    accelerator: "CommandOrControl+Shift+4",
                    click() { win.webContents.send("view", "right"); }
                }
            ]
        }
    ];

    win.once("ready-to-show", () => {
        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
        win.show()
    });

    ipcMain.on("save-file-value", (event, args) => {
        let options = {
            title: "Save Tex file",

            properties: ['saveFile'],

            buttonLabel : "Save Tex File",

            filters :[
                {name: "Tex File", extensions: ["tex"]},
                {name: "Text File", extensions: ["text", "txt"]}
            ]
        };

        dialog.showSaveDialog(win, options)
        .then(result => {
            let filepath = result.filePath;
            if(filepath == "") return false;
            fs.writeFile(filepath, args, "utf-8", (err) => {
                if (err) throw err;
            });
        });
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});