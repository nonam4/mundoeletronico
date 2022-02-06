const { app, BrowserWindow, Menu, Tray } = require( 'electron' )
const isDev = require( 'electron-is-dev' )
const path = require( 'path' )

require( '@electron/remote/main' ).initialize()

function createWindow ( show ) {

    const win = new BrowserWindow( {
        width: 800,
        height: 600,
        maximizable: false,
        resizable: false,
        icon: getIcon(),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
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


    const filter = {
        urls: [ 'https://mundoeletronico.vercel.app/*' ] // Remote API URS for which you are getting CORS error
    }

    win.webContents.session.webRequest.onBeforeSendHeaders(
        filter,
        ( details, callback ) => {
            details.requestHeaders.Origin = `https://mundoeletronico.vercel.app/*`
            callback( { requestHeaders: details.requestHeaders } )
        }
    )

    win.webContents.session.webRequest.onHeadersReceived(
        filter,
        ( details, callback ) => {
            details.responseHeaders[ 'access-control-allow-origin' ] = [ '*' ]
            callback( { responseHeaders: details.responseHeaders } )
        }
    )
}

// pega o ícone da janela
function getIcon () {
    if ( process.platform !== 'win32' ) return '/etc/MundoEletronico/resources/icon.png'
    return isDev ? 'public/icon.ico' : `file://${ path.join( __dirname, '../build/icon.ico' ) }`
}

app.on( 'ready', () => {
    createWindow( false )
} )

exports.callCreateWindow = function callCreateWindow ( show ) {
    createWindow( show )
}

exports.criarTray = function criarTray () {
    let tray = new Tray( getIcon() )
    tray.setToolTip( 'Mundo Eletrônico' )

    tray.setContextMenu( Menu.buildFromTemplate( [ {
        label: 'Abrir', click: () => {
            createWindow( true )
            tray.destroy()
        }
    } ] ) )
}