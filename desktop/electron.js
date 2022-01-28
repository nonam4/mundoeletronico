import * as path from 'path'
import { app, BrowserWindow } from 'electron'
import * as isDev from 'electron-is-dev'

const platform = process.platform
// Variável que irá conter a janela principal
let window = undefined
let currentState = 'idle'

function getIcon () {
    if ( platform === 'win32' ) {
        return 'resources/icon.ico'
    } else {
        return '/etc/MundoEletronico/resources/icon.ico'
    }
}

function createWindow () {
    // Cria a janela do sistema
    window = new BrowserWindow( {
        width: 800,
        height: 600,
        icon: getIcon(),
        maximizable: false,
        resizable: false,
        webPreferences: {
            preload: path.join( __dirname, 'preload.js' ),
            nodeIntegration: true,
            contextIsolation: false
        }
    } )

    // Carrega a página
    if ( isDev ) window.loadURL( 'http://localhost:3000' )
    if ( !isDev ) window.loadURL( `file://${ path.join( __dirname, '../build/index.html' ) }` )

    // Remove os menus da janela
    window.removeMenu()

    // Abre o console se estiver em ambinte Dev
    if ( isDev ) window.webContents.openDevTools( { mode: 'detach' } )

    window.on( 'close', event => {

        if ( status == "dados" ) {
            event.preventDefault()
            webContents.send( 'erro', 'Entre em contato com o suporte via WhatsApp - (47) 99964-9667' )
        } else if ( !app.isQuiting ) {
            event.preventDefault()
            tela = false
            mainWindow.hide()
            criarTray()
        }
        return false
    } )
}

// Quando o electron estiver pronto cria a janela na tela
app.whenReady().then( createWindow )

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on( "window-all-closed", () => {
    if ( process.platform !== "darwin" ) {
        app.quit();
    }
} );



app.on( "activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if ( BrowserWindow.getAllWindows().length === 0 ) {
        createWindow();
    }
} );

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.