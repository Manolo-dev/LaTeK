import {
    app,
    BrowserWindow,
    Menu,
    dialog,
    ipcMain,
    MenuItemConstructorOptions,
    MenuItem,
    SaveDialogOptions
} from 'electron';
import * as fs from 'fs';
import * as path from 'path';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if(require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit();
}

function createWindow() {
    const win = new BrowserWindow({
        width          : 800,
        height         : 600,
        icon           : "./favicon.ico",
        webPreferences : {
            nodeIntegration  : true,
            contextIsolation : false,
            preload          : path.join(__dirname, "preload.js")
        }
    });

    win.webContents.openDevTools();

    win.loadFile("index.html");

    // eslint-disable-next-line one-var
    const template = [
        {
            label   : "File",
            submenu : [
                {
                    label       : "Open",
                    accelerator : "CommandOrControl+o",
                    click() {
                        const options = {
                            title: "Open Tex file",

                            properties: ["openFile"] as (
                                "openFile" |
                                "openDirectory"|
                                "multiSelections" |
                                "showHiddenFiles" |
                                "createDirectory" |
                                "promptToCreate" |
                                "noResolveAliases" |
                                "treatPackageAsDirectory" |
                                "dontAddToRecent"
                                )[],

                            buttonLabel: "Open Tex File",

                            filters: [
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
                    label       : "Import",
                    accelerator : "CommandOrControl+Shift+o",
                    click() {
                        const options = {
                            title: "Open Tex file without clearing",

                            properties: ['openFile'] as (
                                "openFile" |
                                "openDirectory" |
                                "multiSelections" |
                                "showHiddenFiles" |
                                "createDirectory" |
                                "promptToCreate" |
                                "noResolveAliases" |
                                "treatPackageAsDirectory" |
                                "dontAddToRecent"
                                )[],

                            buttonLabel: "Open Tex File",

                            filters: [
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
                    label       : "Save",
                    accelerator : "CommandOrControl+s",
                    click() {
                        win.webContents.send("save-file");
                    }
                }, {
                    label       : "Export",
                    accelerator : "CommandOrControl+e",
                    click() {
                        win.webContents.send("export-image");
                    }
                },
                {type: "separator"},
                {
                    label       : "Reload",
                    accelerator : "CommandOrControl+r",
                    click() { win.reload(); }
                }, {
                    label       : "Exit",
                    accelerator : "CommandOrControl+q",
                    click() { app.quit(); }
                }
            ]

        }, {
            label   : "Edit",
            submenu : [
                {
                    label       : "Undo",
                    accelerator : "CommandOrControl+z"
                }, {
                    label       : "Redo",
                    accelerator : "CommandOrControl+y"
                },
                {type: "separator"},
                {
                    label       : "Cut",
                    accelerator : "CommandOrControl+x",
                    click() { win.webContents.send("cut"); }
                }, {
                    label       : "Copy",
                    accelerator : "CommandOrControl+c",
                    click() { win.webContents.send("copy"); }
                }, {
                    label       : "Paste",
                    accelerator : "CommandOrControl+v",
                    click() { win.webContents.send("paste"); }
                }
            ]
        },
        {
            label   : "View",
            submenu : [
                {
                    label       : "Top-Bottom",
                    accelerator : "CommandOrControl+Shift+1",
                    click() { win.webContents.send("view", "top"); }
                }, {
                    label       : "Bottom-Top",
                    accelerator : "CommandOrControl+Shift+2",
                    click() { win.webContents.send("view", "bottom"); }
                }, {
                    label       : "Left-Right",
                    accelerator : "CommandOrControl+Shift+3",
                    click() { win.webContents.send("view", "left"); }
                }, {
                    label       : "Right-Left",
                    accelerator : "CommandOrControl+Shift+4",
                    click() { win.webContents.send("view", "right"); }
                }
            ]
        }
    ] as (MenuItemConstructorOptions | MenuItem)[];

    win.once("ready-to-show", () => {
        const menu = Menu.buildFromTemplate(template);

        Menu.setApplicationMenu(menu);
        win.show();
    });

    ipcMain.on("save-file-value", (event, args) => {
        const options = {
            title: "Save Tex file",

            properties: [] as (
                "showHiddenFiles" |
                "createDirectory" |
                "treatPackageAsDirectory" |
                "dontAddToRecent" |
                "showOverwriteConfirmation"
                )[],

            buttonLabel: "Save Tex File",

            filters: [
                {name: "Tex File", extensions: ["tex"]},
                {name: "Text File", extensions: ["text", "txt"]}
            ]
        } as SaveDialogOptions;

        dialog.showSaveDialog(win, options)
            .then(result => {
                const filepath = result.filePath;

                if(filepath == "") return false;
                fs.writeFile(filepath, args, "utf-8", (err: any) => {
                    if(err) throw err;
                });
            });
    });
}

// This method will be called when Electron has finished
// Initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// For applications and their menu bar to stay active until the user quits
// Explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // Dock icon is clicked and there are no other windows open.
    if(BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// Code. You can also put them in separate files and import them here.
