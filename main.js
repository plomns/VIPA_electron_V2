const { app, BrowserWindow} = require('electron');
const remoteMain = require("@electron/remote/main");
remoteMain.initialize();
const createWindow = () => {
    const win = new BrowserWindow({
      width: 1000,
      height: 700,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        devTools: false,
        // devTools: true,
      }
    });
    // const devTools = new BrowserWindow();
    remoteMain.enable(win.webContents);
    win.loadFile('index.html');
    win.removeMenu();
    // win.webContents.setDevToolsWebContents(devTools.webContents);
    // win.webContents.openDevTools({ mode: 'detach' });
  }

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })