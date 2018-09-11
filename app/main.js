const { app, BrowserWindow, dialog } = require('electron')
const fs = require('fs')
const windows = new Set()

let mainWindow = null

app.on('ready', () => {
    createWindow()
})

app.on('window-all-closed', () => {
    if(process.platform === 'darwin') {
        return false // Macs don't close the app when the windows are all closed.
    }
    app.quit()
})

app.on('activate', (event, hasVisibleWindows) => {
    if (!hasVisibleWindows) { createWindow() } // Other half of the Mac no-close behavior
})

const createWindow = exports.createWindow = () => {
    let x,y
    const currentWindow = BrowserWindow.getFocusedWindow()

    if (currentWindow) {
        const [currentWindowX, currwntWindowY] = currentWindow.getPosition()
        x = currentWindowX + 10
        y = currwntWindowY + 10
    }
    // Set up a renderer process (BrowserWindow)
    let newWindow = new BrowserWindow({ x, y, show: false })
    newWindow.loadURL(`file://${__dirname}/index.html`)

    newWindow.once('ready-to-show', () => {
        newWindow.show()
    })

    newWindow.on('closed', () => {
        windows.delete(newWindow)
        newWindow = null
    })

    windows.add(newWindow)
    return newWindow
}

const getFileFromUser = exports.getFileFromUser = (targetWindow) => { // exported so that a renderer process can use it
    const files = dialog.showOpenDialog(targetWindow, {
        properties: ['openFile'],
        buttonLabel: "read me",
        filters: [
            {name: 'Text Files', extensions: ['txt']},
            {name: 'Markdown files', extensions: ['md','markdown']}
        ]
    })
    if (files) { openFile(targetWindow, files[0])}
}

const openFile = (targetWindow, file) => {
    const content = fs.readFileSync(file).toString()
    targetWindow.webContents.send('file-opened', file, content)
}