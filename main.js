import { app, BrowserWindow, Menu, dialog } from 'electron';
import moment from 'moment';
import path from 'path';

let mainWindow = null;
let willQuit = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    maxWidth: 900,
    minWidth: 700,
    height: 700,
    minHeight: 500,
    fullscreenable: false,
    backgroundColor: '#403F4D',
    icon: path.join(__dirname, 'assets/png/128x128.png')
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

function menuSetup() {
  const menuTemplate = [
    {
      label: 'Application',
      submenu: [
        {
          label: 'About todometer',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'todometer is built by Cassidy Williams',
              detail: 'You can find her on GitHub and Twitter as @cassidoo, or on her website cassidoo.co.',
              icon: path.join(__dirname, 'assets/png/64x64.png')
            });
          }
        }, {
          type: 'separator'
        /* For debugging
        }, {
          label: 'Dev tools',
          click: () => {
            mainWindow.webContents.openDevTools();
          }
          */
        }, {
          label: 'Close',
          accelerator: 'CommandOrControl+W',
          click: () => {
            mainWindow.hide();
          }
        }, {
          label: 'Quit',
          accelerator: 'CommandOrControl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CommandOrControl+Z',
          selector: 'undo:'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CommandOrControl+Z',
          selector: 'redo:'
        },
        {
          label: 'Cut',
          accelerator: 'CommandOrControl+X',
          selector: 'cut:'
        },
        {
          label: 'Copy',
          accelerator: 'CommandOrControl+C',
          selector: 'copy:'
        },
        {
          label: 'Paste',
          accelerator: 'CommandOrControl+V',
          selector: 'paste:'
        },
        {
          label: 'Select All',
          accelerator: 'CommandOrControl+A',
          selector: 'selectAll:'
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.on('ready', () => {
  createWindow();
  menuSetup();

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
