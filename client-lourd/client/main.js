const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');

let appWindow
let chatWindow

function initWindow() {
  appWindow = new BrowserWindow({
    // fullscreen: true,
    minWidth: 960,
    minHeight: 720,
    icon: __dirname + '/dist/client/favicon.ico',
    webPreferences: {
      nodeIntegration: true,
    }
  })
  appWindow.maximize();
  // Electron Build Path
  appWindow.loadURL(`file://${__dirname}/dist/client/index.html`);
  appWindow.setMenuBarVisibility(process.argv.includes('dev'))
  // Initialize the DevTools.
  //appWindow.webContents.openDevTools()
  appWindow.webContents.on('devtools-opened', () => {
    if (!process.argv.includes('dev')) appWindow.webContents.closeDevTools();
  })
  appWindow.on('close', () => {
    //nothing for noe
  });
  appWindow.on('closed', function () {
    appWindow = undefined;
  })
}

app.on('ready', initWindow)

// Close when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (win === null) {
    initWindow()
  }
})

//----- Pour le chat en fenetre -----//
function openChatWindow() {
  const { BrowserWindow } = require('electron');
  chatWindow = new BrowserWindow({ parent: appWindow, height: 400, width: 400, webPreferences: { nodeIntegration: true } })
  chatWindow.removeMenu();
  chatWindow.setResizable(false);
  chatWindow.loadURL(`file://${__dirname}/dist/client/index.html#/chat-window`);
  chatWindow.setMenuBarVisibility(false)
  // chatWindow.webContents.on('devtools-opened', () => {
  //   chatWindow.webContents.closeDevTools();
  // })
  chatWindow.on('close', () => {
    appWindow.webContents.send('chat-closed');
  })
  chatWindow.on('closed', () => {
    chatWindow = undefined;
  })
}


ipcMain.on('openChatWindow', () => {
  openChatWindow();
});

ipcMain.on('closeChatWindow', (event, arg) => {
  if (chatWindow) {
    chatWindow.close();
  }
})

ipcMain.on('request-chat-data', () => {
  appWindow.webContents.send('post-request-chat-data');
})

ipcMain.on('response-chat-data', (event, arg) => {
  if (chatWindow) {
    chatWindow.webContents.send('send-chat-data', arg);
  }
});

ipcMain.on('send-to-chat-window', (event, arg) => {
  if (chatWindow) {
    chatWindow.webContents.send('send-chat-data-with-message', arg);
  }
})

ipcMain.on('send-update-to-chat-window', (event, arg) => {
  if (chatWindow) {
    chatWindow.webContents.send('receive-update-to-chat-window', arg);
  }
})

ipcMain.on('send-delete-to-chat-window', (event, arg) => {
  if (chatWindow) {
    chatWindow.webContents.send('receive-delete-to-chat-window', arg);
  }
})

ipcMain.on('send-message-from-chat-window', (event, arg) => {
  if (appWindow) {
    appWindow.webContents.send('receive-message-from-chat-window', arg);
  }
})

ipcMain.on('create-channel-from-chat-window', (event, arg) => {
  if (appWindow) {
    appWindow.webContents.send('receive-create-channel-from-chat-window', arg);
  }
})

ipcMain.on('join-channel-from-chat-window', (event, arg) => {
  if (appWindow) {
    appWindow.webContents.send('receive-join-channel-from-chat-window', arg);
  }
})

ipcMain.on('delete-channel-from-chat-window', (event, arg) => {
  if (appWindow) {
    appWindow.webContents.send('receive-delete-channel-from-chat-window', arg);
  }
})

ipcMain.on('leave-channel-from-chat-window', (event, arg) => {
  if (appWindow) {
    appWindow.webContents.send('receive-leave-channel-from-chat-window', arg);
  }
})

ipcMain.on('switch-channel-from-window', (event, arg) => {
  if (appWindow) {
    appWindow.webContents.send('receive-switch-channel-from-window', arg);
  }
})