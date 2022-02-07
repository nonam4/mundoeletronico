const fs = window.require( 'fs' )
const { app } = window.require( '@electron/remote' )

class Storage {
    constructor() {
        this.paths = {
            json: `${ app.getAppPath() }/settings.json`
        }

        // valores padrões
        this.dados = {
            id: undefined,
            local: '',
            proxy: {
                active: false,
                user: '',
                pass: '',
                host: '',
                port: ''
            },
            dhcp: {
                active: true,
                ips: ''
            },
            tema: 'claro'
        }
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
    fs.writeFile( `${ app.getAppPath() }/logs/${ new Date().getTime() }.txt`, String( log ), err => {
        if ( err ) console.log( err )
    } )
}

