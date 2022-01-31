const fs = window.require( 'fs' )
const { app } = window.require( '@electron/remote' )

class Storage {
    constructor() {
        this.paths = {
            json: `${ app.getAppPath() }/settings.json`,
            logs: `${ app.getAppPath() }/logs/`
        }

        // valores padrões
        this.dados = { proxy: false, dhcp: true, tema: 'claro' }
    }

    init ( callback ) {
        let paths = this.paths

        fs.readFile( paths.json, 'utf8', ( err, dados ) => {
            if ( err ) this.createLog( `Impossível ler dados iniciais de configuração -> ${ err }` )
            if ( !err ) this.dados = JSON.parse( dados )
            callback()
        } )
    }

    get ( key ) {
        return this.dados[ key ]
    }

    set ( value, callback ) {
        this.dados = value
        fs.writeFile( paths.json, JSON.stringify( value ), err => {
            if ( err ) this.createLog( `Impossível gravar dados de configuração -> ${ err }` )
            callback()
        } )
    }

    createLog ( log ) {
        fs.writeFile( `${ paths.logs }${ new Date().getTime() }.txt`, String( log ), err => {
            if ( err ) console.log( err )
        } )
    }
}

export default Storage
