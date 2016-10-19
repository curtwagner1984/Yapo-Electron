const electron = require('electron');
const {app, BrowserWindow} = electron;
const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;


let win = undefined;

app.on('window-all-closed', app.quit);

app.on('ready', () => {
    win = new BrowserWindow({width: 1800, height: 800});
    win.loadURL('file://' + __dirname + '/index.html');
    // win.webContents.openDevTools()
});



ipc.on('add-dir', function (event) {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }, function (files) {
        if (files) event.sender.send('got-dir', files[0])
    })
});