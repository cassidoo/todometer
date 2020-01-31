const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  powerMonitor,
  shell
} = require("electron");

const datefns = require("date-fns");
const path = require("path");
const { version } = require("../package.json");
const isDev = require("electron-is-dev");

let mainWindow = {
  show: () => {
    console.log("show");
  }
}; // temp object while app loads
let willQuit = false;

function createWindow() {
  console.log(__dirname);
  mainWindow = new BrowserWindow({
    width: 800,
    minWidth: 320,
    height: 600,
    fullscreenable: true,
    backgroundColor: "#403F4D",
    icon: path.join(__dirname, "assets/png/128x128.png"),
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
}

function manageRefresh() {
  const newTime = datefns.differenceInMilliseconds(datefns.endOfToday(), new Date());

  setTimeout(midnightTask, newTime);

  function midnightTask() {
    mainWindow.reload();
  }
}

function menuSetup() {
  const menuTemplate = [
    {
      label: "todometer",
      submenu: [
        {
          label: "About",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About",
              message: "todometer is built by @cassidoo",
              detail:
                "You can find her on GitHub and Twitter as @cassidoo, or on her website cassidoo.co.",
              icon: path.join(__dirname, "assets/png/64x64.png")
            });
          }
        },
        {
          label: "Contribute (v" + version + ")",
          click: () => {
            shell.openExternal("https://github.com/cassidoo/todometer");
          }
        },
        {
          type: "separator"
        },
        // {
        //   /* For debugging */
        //   label: "Dev tools",
        //   click: () => {
        //     mainWindow.webContents.openDevTools();
        //   }
        // },
        {
          label: "Quit",
          accelerator: "CommandOrControl+Q",
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "delete" },
        { role: "selectall" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "togglefullscreen" },
        { role: "minimize" },
        { role: "hide" },
        { role: "close" }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.on("ready", () => {
  createWindow();
  menuSetup();

  powerMonitor.on("resume", () => {
    mainWindow.reload();
  });

  mainWindow.on("close", e => {
    if (willQuit) {
      mainWindow = null;
    } else {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  manageRefresh();
});

app.on("activate", () => mainWindow.show());
app.on("before-quit", () => (willQuit = true));
