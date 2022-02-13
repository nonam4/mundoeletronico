const { app, BrowserWindow, Menu, Tray } = require( 'electron' )
const downloader = require( 'electron-download-manager' )
const isDev = require( 'electron-is-dev' )
const path = require( 'path' )

downloader.register( { downloadFolder: `${ app.getAppPath() }/updates` } )
require( '@electron/remote/main' ).initialize()

function createWindow ( show ) {

    const win = new BrowserWindow( {
        width: 900,
        height: 600,
        maximizable: false,
        resizable: false,
        icon: getIcon(),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            webSecurity: false // previne erros de cors
        }, show
    } )
    // remove o menu da janela
    win.removeMenu()
    //if ( isDev && show ) win.webContents.openDevTools()
    win.webContents.openDevTools()
    // carrega a página principal
    win.loadURL(
        isDev ? 'http://localhost:3000' : `file://${ path.join( __dirname, '../build/index.html' ) }`
    )
    // define ações quando o usuário clicar no botão de fechar
    win.on( 'close', ( e ) => {
        e.preventDefault()
        return false
    } )
}

// pega o ícone da janela
function getIcon () {
    if ( process.platform !== 'win32' ) return '/etc/MundoEletronico/resources/icon.png'
    return isDev ? 'public/icon.ico' : `file://${ path.join( __dirname, '../build/icon.ico' ) }`
}

app.on( 'ready', () => {
    createWindow( false )
} )

exports.criarTray = function criarTray () {
    let tray = new Tray( getIcon() )
    tray.setToolTip( 'Mundo Eletrônico' )

    tray.setContextMenu( Menu.buildFromTemplate( [ {
        label: 'Abrir', click: () => {
            // pega todas as janelas possíveis, terá somente uma que é a janela atual
            // mostre ela pois ela está somente escondida
            BrowserWindow.getAllWindows()[ 0 ].show()
            tray.destroy()
        }
    } ] ) )
}