import { app, BrowserWindow } from 'electron';

let mainWindow = null;
let willQuit = false;

function createWindow() {
  mainWindow = new BrowserWindow({width: 800, maxWidth: 800, height: 600, fullscreenable: false}); //, titleBarStyle: 'hidden'});
  mainWindow.loadURL('file://' + __dirname + '/index.html');
}

app.on('ready', () => {
  createWindow();

  mainWindow.on('close', (e) => {
    if (willQuit) {
      mainWindow = null;
    } else {
      e.preventDefault();
      mainWindow.hide();
    }
  });
});

app.on('activate', () => mainWindow.show());
app.on('before-quit', () => willQuitApp = true);
