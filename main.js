import { app, BrowserWindow } from 'electron';
import moment from 'moment';

let mainWindow = null;
let willQuit = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    maxWidth: 800,
    height: 600,
    fullscreenable: false,
    backgroundColor: '#403F4D'
  });
  mainWindow.loadURL('file://' + __dirname + '/index.html');
}

function manageRefresh() {
  const time = moment('24:00:00', 'hh:mm:ss').diff(moment(), 'seconds');
  setTimeout(
    midnightTask,
    time*1000
  );

  function midnightTask() {
    mainWindow.reload();
  }
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

  manageRefresh();
});

app.on('activate', () => mainWindow.show());
app.on('before-quit', () => willQuit = true);
