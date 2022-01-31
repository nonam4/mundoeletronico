const { app, BrowserWindow, Menu, Tray } = require( 'electron' )
const isDev = require( 'electron-is-dev' )
const path = require( 'path' )

require( '@electron/remote/main' ).initialize()

function createWindow () {
    const win = new BrowserWindow( {
        width: 800,
        height: 600,
        maximizable: false,
        resizable: false,
        icon: getIcon(),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    } )
    // remove o menu da janela
    win.removeMenu()
    win.webContents.openDevTools()
    // carrega a página principal
    win.loadURL(
        isDev ? 'http://localhost:3000' : `file://${ path.join( __dirname, '../build/index.html' ) }`
    )
    // define ações quando o usuário clicar no botão de fechar
    win.on( 'close', ( e ) => {
        e.preventDefault()

        win.hide()
        criarTray()
        return false
    } )
}

// pega o ícone da janela
function getIcon () {
    if ( process.platform === 'win32' ) {
        return 'public/icon.ico'
    } else {
        return '/etc/MundoEletronico/resources/icon.png'
    }
}

const criarTray = () => {
    let tray = new Tray( getIcon() )
    tray.setToolTip( 'Mundo Eletrônico' )

    tray.setContextMenu( Menu.buildFromTemplate( [ {
        label: 'Abrir', click: () => {
            tray.destroy()
            createWindow()
        }
    } ] ) )
}

app.on( 'ready', createWindow )//() => { criarTray()} )