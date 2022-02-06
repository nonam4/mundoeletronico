const { app, BrowserWindow, Menu, Tray } = require( 'electron' )
const isDev = require( 'electron-is-dev' )
const path = require( 'path' )

require( '@electron/remote/main' ).initialize()

function createWindow ( show ) {

    // URLs que o CORS vai aceitar
    const corsUrls = { urls: [ 'https://mundoeletronico.vercel.app/*' ] }
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

    // evita que dê erro no CORS
    win.webContents.session.webRequest.onBeforeSendHeaders(
        corsUrls, ( _details, callback ) => {
            callback( { requestHeaders: { Origin: '*' } } )
        }
    )

    win.webContents.session.webRequest.onHeadersReceived(
        corsUrls, ( _details, callback ) => {
            callback( { responseHeaders: { 'Access-Control-Allow-Origin': [ '*' ] } } )
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