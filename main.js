import { app, BrowserWindow, Menu, Tray, dialog, shell } from 'electron';
import moment from 'moment';
import path from 'path';

let mainWindow = null;
let willQuit = false;
let tray = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        frame: false,
        resizable: false,
        height: 600,
        fullscreenable: false,
        backgroundColor: '#403F4D',
        icon: path.join(__dirname, 'assets/png/128x128.png')
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
}

function manageRefresh() {
    const time = moment('24:00:00', 'hh:mm:ss').diff(moment(), 'seconds');
    setTimeout(midnightTask, time * 1000);

    function midnightTask() {
        mainWindow.reload();
    }
}

function traySetup() {
    tray = new Tray(path.join(__dirname, 'assets/png/128x128.png'));
    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    });
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open todometer',
            click: () => {
                mainWindow.show();
            }
        }, {
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
        }, {
            type: 'separator'
        }, {
            label: 'Quit todometer',
            click: () => {
                app.quit();
            }
        }
    ]);
    tray.setToolTip('todometer');
    tray.setContextMenu(contextMenu);
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
                }, {
                    label: 'Contribute',
                    click: () => {
                        shell.openExternal('http://github.com/cassidoo/todometer');
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
                    label: 'Quit',
                    accelerator: 'CommandOrControl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        }, {
            label: 'Edit',
            submenu: [
                {
                    role: 'undo'
                }, {
                    role: 'redo'
                }, {
                    role: 'cut'
                }, {
                    role: 'copy'
                }, {
                    role: 'paste'
                }, {
                    role: 'delete'
                }, {
                    role: 'selectall'
                }
            ]
        }, {
            label: 'View',
            submenu: [
                {
                    role: 'reload'
                }, {
                    role: 'togglefullscreen'
                }, {
                    role: 'minimize'
                }, {
                    role: 'hide'
                }, {
                    role: 'close'
                }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}

app.on('ready', () => {
    createWindow();
    if (process.platform === 'darwin') {
        menuSetup();
    }
    traySetup();

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
