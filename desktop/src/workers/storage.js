const fs = window.require( 'fs' )
const { app } = window.require( '@electron/remote' )
const path = window.require( 'path' )
const isDev = window.require( '@electron/remote' ).require( 'electron-is-dev' )

class Storage {
    constructor() {
        this.paths = { json: getRootPath( 'settings.json' ) }
        // valores padrões
        this.dados = { id: '', local: '', proxy: false, user: '', pass: '', host: '', port: 8080, dhcp: true, ip: '', tema: 'claro' }
    }

    init ( callback ) {
        fs.readFile( this.paths.json, 'utf8', ( err, dados ) => {
            if ( err ) createLog( `Impossível ler dados iniciais de configuração -> ${ err }` )
            if ( !err ) this.dados = JSON.parse( dados )
            callback()
        } )
    }

    get ( key ) {
        return this.dados[ key ]
    }

    set ( value, callback ) {
        this.dados = value
        fs.writeFile( this.paths.json, JSON.stringify( value ), err => {
            if ( err ) createLog( `Impossível gravar dados de configuração -> ${ err }` )
            callback()
        } )
    }
}
export default Storage

export function createLog ( log ) {
    fs.writeFile( `${ getRootPath( 'logs' ) }/${ new Date().getTime() }.txt`, String( log ), err => {
        if ( err ) console.log( err )
    } )
}

export function getRootPath ( item ) {
    return isDev ? `${ app.getAppPath() }/${ item }` : `${ path.join( app.getAppPath(), `../../${ item }` ) }`
}

