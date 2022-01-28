// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, Tray, ipcMain, shell } = require( 'electron' )
const path = require( 'path' )
const url = require( 'url' )
const axios = require( 'axios' )
const snpm = require( 'net-snmp' )
const printers = require( './impressoras.js' )
const storage = new ( require( './storage.js' ) )()
const downloader = require( "electron-download-manager" )
downloader.register( { downloadFolder: 'C:/Program Files/Mundo Eletronico/updates' } )

const dhcp = () => {
    return new Promise( resolve => {
        const getip = () => {
            var interfaces = require( 'os' ).networkInterfaces()
            const myIp = () => {
                for ( var k in interfaces ) {
                    var inter = interfaces[ k ]
                    for ( var j in inter )
                        if ( inter[ j ].family === 'IPv4' && !inter[ j ].internal )
                            return inter[ j ].address
                }
            }
            var ip = myIp()
            if ( ip != undefined ) {
                ip = ip.split( '.' )
                resolve( ip[ 0 ] + '.' + ip[ 1 ] + '.' + ip[ 2 ] + '.' )
            } else {
                setTimeout( () => {
                    getip()
                }, 2000 )
            }
        }
        getip()
    } )
}

const icon = () => {
    if ( process.platform === "win32" ) {
        return "resources/icon.png"
    } else {
        return "/etc/MundoEletronico/resources/icon.png"
    }
}

//status: atualizando, recebendo, dados
var status = null
var tray = null
var cliente = null
var tela = false
var webContents = null
var mainWindow = null
var updateURL

const createWindow = () => {
    // cria a janela principal
    mainWindow = new BrowserWindow( {
        width: 800,
        height: 600,
        icon: icon(),
        maximizable: false,
        resizable: false,
        webPreferences: {
            preload: path.join( __dirname, 'preload.js' ),
            nodeIntegration: true,
            contextIsolation: false
        }
    } )

    mainWindow.loadURL( url.format( {
        pathname: path.join( __dirname, 'index.html' ),
        protocol: 'file:',
        slashes: true
    } ) )
    mainWindow.removeMenu()
    // abre o console
    //ainWindow.webContents.openDevTools()
    mainWindow.on( 'close', event => {
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

    webContents = mainWindow.webContents
    switch ( status ) {
        case "atualizando":
            webContents.on( 'did-finish-load', () => {
                webContents.send( 'update' )
            } )
            break
        case "recebendo":
            webContents.on( 'did-finish-load', () => {
                webContents.send( 'load' )
            } )
            break
        case "dados":
            webContents.on( 'did-finish-load', async () => {
                webContents.send( 'load' )
                webContents.send( 'dados', await dhcp() )
            } )
            break
        default:
            webContents.on( 'did-finish-load', () => {
                webContents.send( 'principal', cliente, app.getVersion() )
            } )
    }
    tela = true
}

// quando o app estiver pronto
app.on( 'ready', () => {
    criarTray()
    storage.init( () => {
        loop()
    } )
} )

/*
* listeners da tela
*/
ipcMain.on( 'gravarDados', ( event, dados ) => {
    gravarDados( dados )
} )

ipcMain.on( 'atualizarDados', event => {
    conferirDados()
} )

ipcMain.on( 'forceUpdate', event => {
    if ( process.platform === "win32" ) {
        atualizar()
    } else {
        if ( tela ) {
            webContents.send( 'principal', cliente, app.getVersion() )
            webContents.send( 'erro', "Atualizações desativadas nessa plataforma!" )
        }
    }
} )

ipcMain.on( 'editarDados', event => {
    editarDados()
} )

/*
/ minhas funções
*/
const loop = () => {
    conferirDados()
    setTimeout( () => {
        loop()
    }, 3600000 )
}

const criarTray = () => {
    tray = new Tray( icon() )
    tray.setToolTip( 'Mundo Eletrônico' )

    var contextMenu = Menu.buildFromTemplate( [
        {
            label: 'Abrir', click: () => {
                tray.destroy()
                createWindow()
            }
        }
    ] )
    tray.setContextMenu( contextMenu )
}

const conferirDados = () => {

    status = "recebendo"
    var dados = new Object()
    dados.versao = app.getVersion()
    dados.id = storage.get( 'id' )
    dados.local = storage.get( 'local' )

    dados.proxy = storage.get( 'proxy' )
    dados.user = storage.get( 'user' )
    dados.pass = storage.get( 'pass' )
    dados.host = storage.get( 'host' )
    dados.port = storage.get( 'port' )

    dados.dhcp = storage.get( 'dhcp' )
    dados.ip = storage.get( 'ip' )

    if ( dados.proxy === undefined || dados.id === undefined || dados.dhcp === undefined || dados.proxy === '' || dados.id === '' || dados.dhcp === '' ) {
        pedirDados()
    } else {
        receberDados( dados )
    }
}

const pedirDados = () => {
    status = "dados"
    tray.destroy()
    createWindow()
}

const editarDados = async () => {
    status = "dados"

    var dados = new Object()
    dados.id = storage.get( 'id' )
    dados.local = storage.get( 'local' )

    dados.proxy = storage.get( 'proxy' )
    if ( dados.proxy ) {
        dados.user = storage.get( 'user' )
        dados.pass = storage.get( 'pass' )
        dados.host = storage.get( 'host' )
        dados.port = storage.get( 'port' )
    }

    dados.dhcp = storage.get( 'dhcp' )
    if ( !dados.dhcp ) {
        dados.ip = storage.get( 'ip' )
    } else {
        dados.ip = await dhcp()
    }
    webContents.send( 'editarDados', dados )
}

const gravarDados = dados => {

    var local = new Object()
    local.id = dados.id
    local.local = dados.local

    local.proxy = dados.proxy
    if ( dados.proxy ) {
        local.user = dados.user
        local.pass = dados.pass
        local.host = dados.host
        local.port = dados.port
    }

    local.dhcp = dados.dhcp
    if ( !dados.dhcp ) {
        local.ip = dados.ip
    }

    storage.set( local, () => {
        conferirDados()
    } )
}

const receberDados = dados => {
    var config
    if ( dados.proxy ) {
        config = {
            url: 'http://us-central1-ioi-printers.cloudfunctions.net/dados',
            params: {
                plataforma: 'coletor',
                id: dados.id,
                versao: dados.versao,
                local: dados.local,
                sistema: process.platform
            },
            proxy: {
                host: dados.host,
                port: dados.port,
                auth: {
                    username: dados.user,
                    password: dados.pass
                }
            }
        }
    } else {
        config = {
            url: 'http://us-central1-ioi-printers.cloudfunctions.net/dados',
            params: {
                plataforma: 'coletor',
                id: dados.id,
                versao: dados.versao,
                local: dados.local,
                sistema: process.platform
            }
        }
    }
    axios.request( config ).then( res => {
        processarDados( res.data )
    } ).catch( err => {
        storage.log( 'Receber dados => ' + err )
        if ( tela ) {
            webContents.send( 'erro', 'Algum erro aconteceu ao receber os dados!' )
            webContents.send( 'removerLoad' )
        }
    } )
}

const processarDados = dados => {
    updateURL = dados.url
    if ( dados.atualizar && process.platform === "win32" ) {
        atualizar()
    } else if ( dados.valid ) {
        cliente = dados.cliente
        if ( cliente.ativo ) {
            if ( tela ) { webContents.send( 'principal', cliente, app.getVersion() ) }
            buscarIps()
        }
    } else {
        if ( tela ) { webContents.send( 'erro', "A ID do usário está errada!" ) }
    }
    if ( tela ) { webContents.send( 'removerLoad' ) }
}

const atualizar = () => {
    status = "atualizando"

    if ( tela ) { webContents.send( 'update' ) } else {
        tray.destroy()
        createWindow()
    }
    downloader.download( {
        url: updateURL
    }, ( err, info ) => {
        if ( err ) {
            storage.log( 'Download update => ' + err )
            if ( tela ) { webContents.send( 'erro', "Não foi possível baixar as atualizações, reinicando em 3 segundos" ) }
            setTimeout( () => {
                app.relaunch()
                app.exit( 0 )
            }, 3000 )
            return
        } else {
            shell.openExternal( 'file://C:/Program Files/Mundo Eletronico/updater.bat' )
            app.exit( 0 )
        }
    } )
}

var logs = 'Buscando IPs  => \n\n'
const buscarIps = async () => {
    status = null
    var ips = null
    if ( !storage.get( 'dhcp' ) ) {
        ips = storage.get( 'ip' ).split( ";" )
    } else {
        var ip = await dhcp()
        ips = ip.split( ";" )
    }
    for ( var x = 0; x < ips.length; x++ ) {
        var ip = ips[ x ]
        for ( var y = 1; y < 255; y++ ) {
            checarFabricante( ip + y )
        }
    }

    setTimeout( () => {
        storage.log( logs )
        logs = 'Buscando IPs  => \n\n\n'
    }, 15000 )
}

const checarFabricante = ip => {
    const snmp = snpm.createSession( ip, 'public' )
    var oid = [ "1.3.6.1.2.1.1.1.0" ]
    snmp.get( oid, ( err, res ) => {
        if ( !err ) {
            var marca = res[ 0 ].value + ''
            if ( !marca.toLowerCase().includes( 'switch' ) ) {
                selecionarModelo( marca, snmp, ip )
            } else {
                storage.log( 'Marca contém switch => ' + marca + ' - ' + ip )
                snmp.close()
            }
        } else {
            logs = logs + 'Buscando IP ' + ip + ' => ' + err + '\n\n\n'
            snmp.close()
        }
    } )
}

const selecionarModelo = ( fabricante, snmp, ip ) => {
    var marca = marcaExiste( fabricante )
    var impressora = null
    var impressoras = {
        'brother': new printers.Brother( snmp, ip ),
        'canon': new printers.Canon( snmp, ip ),
        'epson': new printers.Epson( snmp, ip ),
        'hp': new printers.Hp( snmp, ip ),
        'lexmark': new printers.Lexmark( snmp, ip ),
        'oki': new printers.Oki( snmp, ip ),
        'ricoh': new printers.Ricoh( snmp, ip ),
        'samsung': new printers.Samsung( snmp, ip )
    }

    if ( marca != null ) {
        impressora = impressoras[ marca ]

        if ( impressora != null ) {
            impressora.pegarDados().then( res => {
                if ( impressora.modelo != null && impressora.serial != null && impressora.leitura != null
                    && impressora.modelo != '' && impressora.serial != '' && impressora.leitura != '' ) {
                    gravarImpressora( impressora, snmp )
                } else {
                    storage.log( 'Impressora com dados faltando => modelo -> ' + impressora.modelo + ' - leitura -> ' +
                        impressora.leitura + ' - serial -> ' + impressora.serial + ' - ip -> ' + ip )
                    snmp.close()
                }
            } )
        } else {
            storage.log( 'Impressora nula => ' + fabricante + ' - ' + ip )
            snmp.close()
        }
    } else {
        storage.log( 'Marca nula => ' + fabricante + ' - ' + ip )
        snmp.close()
    }
}

const marcaExiste = fabricante => {
    var marcas = [ "brother", "canon", "epson", "hp", "lexmark", "oki", "ricoh", "samsung" ]
    var res = null

    marcas.forEach( marca => {
        if ( fabricante.toLowerCase().includes( marca ) || fabricante.toLowerCase() == marca ) {
            res = marca
            return
        }
    } )
    return res
}

const gravarImpressora = ( impressora, snmp ) => {
    var config
    if ( storage.get( 'proxy' ) ) {
        config = {
            url: 'http://us-central1-ioi-printers.cloudfunctions.net/gravarImpressora',
            params: {
                id: storage.get( 'id' ),
                empresa: cliente.empresa,
                serial: impressora.serial,
                modelo: impressora.modelo,
                leitura: impressora.leitura,
                ip: impressora.ip
            },
            proxy: {
                host: storage.get( 'host' ),
                port: storage.get( 'port' ),
                auth: {
                    username: storage.get( 'user' ),
                    password: storage.get( 'pass' )
                }
            }
        }
    } else {
        config = {
            url: 'http://us-central1-ioi-printers.cloudfunctions.net/gravarImpressora',
            params: {
                id: storage.get( 'id' ),
                empresa: cliente.empresa,
                serial: impressora.serial,
                modelo: impressora.modelo,
                leitura: impressora.leitura,
                ip: impressora.ip
            }
        }
    }
    axios.request( config ).then( res => {
        criarLayoutImpressora( impressora )
        snmp.close()
    } ).catch( err => {
        if ( tela ) { webContents.send( 'erro', "Erro ao gravar impressora ", impressora.serial, ", ", impressora.modelo, ", ", impressora.ip, ", ", impressora.leitura ) }
        storage.log( 'Erro ao gravar impressora no DB => IP -> ' + impressora.ip + ' - Modelo -> ' + impressora.modelo + ' - Serial -> ' + impressora.serial + ' - Erro -> ' + err )
        snmp.close()
    } )
}

const criarLayoutImpressora = impressora => {
    var data = new Date()
    var ano = data.getFullYear()
    var mes = data.getMonth() + 1;
    ( mes < 10 ) ? mes = "0" + mes : 0;
    var dia = data.getDate();
    ( dia < 10 ) ? dia = "0" + dia : 0;

    if ( cliente.impressoras != undefined && cliente.impressoras[ impressora.serial ] !== undefined ) {
        if ( cliente.impressoras[ impressora.serial ].ativa ) {
            //se a impressora existir e for ativa
            if ( cliente.impressoras[ impressora.serial ].leituras[ ano + "-" + mes ] !== undefined ) {
                //se já tiver o primeiro registro de leitura do mês
                cliente.impressoras[ impressora.serial ].leituras[ ano + "-" + mes ].final.valor = parseInt( impressora.leitura )
                cliente.impressoras[ impressora.serial ].leituras[ ano + "-" + mes ].final.dia = dia
            } else {
                //caso seja um mês novo
                cliente.impressoras[ impressora.serial ].leituras = {
                    [ ano + "-" + mes ]: {
                        inicial: {
                            valor: impressora.leitura,
                            dia: dia
                        }, final: {
                            valor: impressora.leitura,
                            dia: dia
                        }
                    }
                }
            }
            //atualiza os niveis de tinta de acordo com a capacidade dele
            if ( cliente.impressoras[ impressora.serial ].tinta.capacidade !== "ilimitado" ) {
                cliente.impressoras[ impressora.serial ].tinta.impresso = impressora.leitura - cliente.impressoras[ impressora.serial ].tinta.cheio
                cliente.impressoras[ impressora.serial ].tinta.nivel = parseInt( 100 - ( ( 100 * cliente.impressoras[ impressora.serial ].tinta.impresso ) / cliente.impressoras[ impressora.serial ].tinta.capacidade ) )
            }
        }
    } else {
        if ( cliente.impressoras == undefined ) {
            cliente.impressoras = new Object()
        }
        cliente.impressoras[ impressora.serial ] = {
            franquia: 0,
            ip: impressora.ip,
            modelo: impressora.modelo,
            setor: "Não informado",
            ativa: true,
            tinta: {
                capacidade: "ilimitado",
                cheio: impressora.leitura,
                impresso: 0,
                nivel: 100
            }, leituras: {
                [ ano + "-" + mes ]: {
                    inicial: {
                        valor: impressora.leitura,
                        dia: dia
                    }, final: {
                        valor: impressora.leitura,
                        dia: dia
                    }
                }
            }
        }
    }
    if ( tela ) { webContents.send( 'principal', cliente, app.getVersion() ) }
}
