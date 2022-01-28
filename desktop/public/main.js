require( '@electron/remote/main' ).initialize()
const { app, BrowserWindow } = require( 'electron' )

function createWindow () {
    const win = new BrowserWindow( {
        width: 800,
        height: 600,
        webPreferences: {
            enableRemoteModule: true
        }
    } )

    win.loadURL( 'http://localhost:3000' )

    win.on( 'close', ( e ) => {
        e.preventDefault()
        win.hide()

        return false
    } )
}

app.on( 'ready', createWindow )