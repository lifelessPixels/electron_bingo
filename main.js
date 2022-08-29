const { app, BrowserWindow, ipcMain } = require('electron');
const { join } = require("path");
const { writeFileSync, readFileSync } = require("fs");

try {
    require('electron-reloader')(module)
} catch (_) {}

let window;

const createWindow = () => {
    window = new BrowserWindow({
        width: 1280,
        height: 720,
        frame: null,
        resizable: false,
        webPreferences: {
            preload: join(__dirname, "preload.js"),
            webSecurity: true
        },
        title: "Bingo!"
    });
    window.webContents.on("before-input-event", (e, input) => {
        if(input.code == "F4" && input.alt)
            e.preventDefault();
    });
    window.setMenu(null);
    window.loadFile("content/index.html");
};

app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        app.quit();
});

ipcMain.on("window-close", (e, args) => {
    console.debug("window closed");
    window.close();
});

ipcMain.on("save-captions", (e, args) => {
    console.log("saving captions to " + join(app.getAppPath(), "captions.txt") + "...");
    let data = "";
    args.forEach((x) => {data += x + "\n"});
    try { writeFileSync(join(app.getAppPath(), "captions.txt"), data, "utf-8"); }
    catch(e) { console.log("unsuccessful save to file"); }
    e.returnValue = null;
});

ipcMain.on("get-captions", (e, args) => {
    console.log("getting captions from " + join(app.getAppPath(), "captions.txt") + "...");
    let data = Array(25);
    let success = true;

    try { 
        let values = readFileSync(join(app.getAppPath(), "captions.txt"), { encoding: "utf-8" }).split("\n").slice(0, 25); 
        if(values.length != 25) success = false;
        else data = values;
    }
    catch(e) { 
        console.log("unsuccessful read from file: " + e);
        success = false; 
    }

    if(!success) {
        for(let i = 1; i <= 25; i++) {
            data[i - 1] = i.toString();
        }
    }
    e.returnValue = data;
});