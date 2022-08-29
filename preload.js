const {contextBridge, ipcRenderer} = require("electron");

function closeWindow() {
    ipcRenderer.sendSync("window-close");
}

function saveCaptions(captions) {
    ipcRenderer.sendSync("save-captions", captions);
}

function getCaptions() {
    return ipcRenderer.sendSync("get-captions");
}

contextBridge.exposeInMainWorld("electronAPI", {
    closeWindow: closeWindow,
    getCaptions: getCaptions,
    saveCaptions: saveCaptions
});