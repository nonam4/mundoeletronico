import axios from 'axios'
import { createLog } from './storage'

class Impressora {
    constructor( snmp, ip ) {
        this.snmp = snmp
        this.ip = ip
    }

    async pegarDados () { }

    async fetchOid ( oid, snmp, mac ) {
        return new Promise( resolve => {
            snmp.get( oid, function ( err, res ) {
                if ( err ) return resolve( undefined )

                //caso seja uma ricoh 3500 o serial será o MAC da placa
                if ( mac ) return resolve( ( res[ 0 ].value ).toString( 'hex' ).toUpperCase() )

                //remove caractéres inválidos, por exemplo: �
                return resolve( ( String( res[ 0 ].value ) ).replace( /[^\w\s]/gi, '' ) )
            } )
        } )
    }
}

export class Brother extends Impressora {
    constructor( snmp, ip ) {
        super( snmp, ip )
    }

    async pegarDados () {
        this.modelo = await this.this.fetchOid( [ '1.3.6.1.2.1.25.3.2.1.3.1' ], this.snmp )
        this.serial = await this.fetchOid( [ '1.3.6.1.2.1.43.5.1.1.17.1' ], this.snmp )
        this.contador = await this.fetchOid( [ '1.3.6.1.2.1.43.10.2.1.4.1.1' ], this.snmp )
    }
}

export class Canon extends Impressora {
    constructor( snmp, ip ) {
        super( snmp, ip )
    }

    async pegarDados () {
        this.modelo = await this.fetchOid( [ '1.3.6.1.2.1.25.3.2.1.3.1' ], this.snmp )
        this.serial = await this.fetchOid( [ '1.3.6.1.2.1.43.5.1.1.17.1' ], this.snmp )
        this.contador = await this.fetchOid( [ '1.3.6.1.2.1.43.10.2.1.4.1.1' ], this.snmp )
    }
}

export class Epson extends Impressora {
    constructor( snmp, ip ) {
        super( snmp, ip )
    }

    async pegarDados () {
        this.modelo = await this.fetchOid( [ '1.3.6.1.2.1.25.3.2.1.3.1' ], this.snmp )
        this.serial = await this.fetchOid( [ '1.3.6.1.4.1.1248.1.2.2.1.1.1.5.1' ], this.snmp )
        if ( this.serial.toLowerCase().includes( 'epson' ) ) this.serial = await this.fetchOid( [ '1.3.6.1.4.1.1248.1.2.2.2.1.1.2.1.2' ], this.snmp )
        if ( this.serial.toLowerCase().includes( 'epson' ) ) this.serial = await this.fetchOid( [ '1.3.6.1.4.1.1248.1.1.3.1.1.33.0' ], this.snmp )
        this.contador = await this.fetchOid( [ '1.3.6.1.2.1.43.10.2.1.4.1.1' ], this.snmp )
    }
}

export class Hp extends Impressora {
    constructor( snmp, ip ) {
        super( snmp, ip )
    }

    async pegarHtml ( ip, modelo ) {
        return new Promise( resolve => {
            axios.get( `http://${ ip }/DevMgmt/ProductUsageDyn.xml` ).then( html => {

                if ( modelo.toLowerCase().includes( 'm127' ) || modelo.toLowerCase().includes( 'm176n' ) ) return resolve( html.data.match( /<dd:TotalImpressions>([^<]*)<\/dd:TotalImpressions>/ )[ 1 ] )
                if ( modelo.toLowerCase().includes( '8600' ) ) return resolve( html.data.match( /<dd:TotalImpressions PEID=\"5082\">([^<]*)<\/dd:TotalImpressions>/ )[ 1 ] )
            } ).catch( err => {
                createLog( `Erro ao acessar site de impressora HP - IP: ${ ip } - Erro: ${ err }` )
                resolve( undefined )
            } )
        } )

    }

    async pegarDados () {
        this.modelo = await this.fetchOid( [ '1.3.6.1.2.1.25.3.2.1.3.1' ], this.snmp )
        this.serial = await this.fetchOid( [ '1.3.6.1.4.1.11.2.3.9.4.2.1.1.3.3.0' ], this.snmp )
        this.contador = await this.fetchOid( [ '1.3.6.1.2.1.43.10.2.1.4.1.1' ], this.snmp )

        if ( this.modelo.toLowerCase().includes( 'm127' )
            || this.modelo.toLowerCase().includes( '8600' )
            || this.modelo.toLowerCase().includes( 'm176' ) ) this.contador = await this.pegarHtml( this.ip, this.modelo )
    }
}

export class Lexmark extends Impressora {
    constructor( snmp, ip ) {
        super( snmp, ip )
    }

    async pegarDados () {
        this.modelo = await this.fetchOid( [ '1.3.6.1.4.1.641.2.1.2.1.2.1' ], this.snmp )
        this.serial = await this.fetchOid( [ '1.3.6.1.4.1.641.2.1.2.1.6.1' ], this.snmp )
        this.contador = await this.fetchOid( [ '1.3.6.1.2.1.43.10.2.1.4.1.1' ], this.snmp )
    }
}

export class Oki extends Impressora {
    constructor( snmp, ip ) {
        super( snmp, ip )
    }

    async pegarDados () {
        this.modelo = await this.fetchOid( [ '1.3.6.1.2.1.25.3.2.1.3.1' ], this.snmp )
        this.serial = await this.fetchOid( [ '1.3.6.1.4.1.2001.1.1.1.1.11.1.10.45.0' ], this.snmp )
        this.contador = await this.fetchOid( [ '1.3.6.1.4.1.2001.1.1.1.1.11.1.10.170.1.8.1' ], this.snmp )
    }
}

export class Ricoh extends Impressora {
    constructor( snmp, ip ) {
        super( snmp, ip )
    }

    async pegarDados () {
        this.modelo = await this.fetchOid( [ '1.3.6.1.2.1.25.3.2.1.3.1' ], this.snmp )
        this.serial = await this.fetchOid( [ '1.3.6.1.4.1.367.3.2.1.2.1.4.0' ], this.snmp )
        //remove todos os espaços em branco entre as palavras
        let serial = this.serial.replace( / /g, '' )
        //se o serial estiver em branco, transforma o MAC em serial
        if ( serial === '' || serial.length === 0 ) this.serial = await this.fetchOid( [ '1.3.6.1.4.1.367.3.2.1.7.2.1.7.1' ], this.snmp, true )
        // se for a 3510 ou outro modelo de ricoh pega por padrão
        this.contador = await this.fetchOid( [ '1.3.6.1.2.1.43.10.2.1.4.1.1' ], this.snmp )
        if ( this.modelo.includes( '3500' ) ) this.contador = await this.fetchOid( [ '1.3.6.1.4.1.367.3.2.1.2.19.2.0' ], this.snmp )
    }
}

export class Samsung extends Impressora {
    constructor( snmp, ip ) {
        super( snmp, ip )
    }

    async pegarDados () {
        this.modelo = await this.fetchOid( [ '1.3.6.1.2.1.25.3.2.1.3.1' ], this.snmp )
        this.serial = await this.fetchOid( [ '1.3.6.1.4.1.236.11.5.1.1.1.4.0' ], this.snmp )
        this.contador = await this.fetchOid( [ '1.3.6.1.2.1.43.10.2.1.4.1.1' ], this.snmp )
    }
}

//export default Impressora