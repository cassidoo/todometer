import electron from 'electron';
import { app, BrowserWindow, Menu, dialog, shell } from 'electron';
import moment from 'moment';
import path from 'path';
import setupEvents from './installers/setupEvents';

let mainWindow = { show: () => { console.log('show'); } }; // temp object while app loads
let willQuit = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    minWidth: 800,
    height: 600,
    fullscreenable: true,
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
      label: 'todometer',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'todometer is built by Cassidy Williams',
              detail: 'You can find her on GitHub and Twitter as @cassidoo, or on her website cassidoo.co.',
              icon: path.join(__dirname, 'assets/png/64x64.png')
            });
          }
        },
        {
          label: 'Contribute (v1.0.4)',
          click: () => {
            shell.openExternal('http://github.com/cassidoo/todometer');
          }
        },
        {
          type: 'separator'
        /* For debugging
        }, {
          label: 'Dev tools',
          click: () => {
            mainWindow.webContents.openDevTools();
          }
          */
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
        {role: 'undo'},
        {role: 'redo'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'delete'},
        {role: 'selectall'}
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'togglefullscreen'},
        {role: 'minimize'},
        {role: 'hide'},
        {role: 'close'}
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.on('ready', () => {
  // Squirrel events have to be handled before anything else
  if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
  }
  createWindow();
  menuSetup();

  electron.powerMonitor.on('resume', () => {
    mainWindow.reload();
    console.log('reloaded');
  });

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
