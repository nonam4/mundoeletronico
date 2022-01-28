const axios = require( 'axios' )

class Impressora {
    constructor( snmp, ip ) {
        this.snmp = snmp
        this.ip = ip
    }

    async pegarDados () {
    }
}

const pegarOid = ( oid, snmp, mac ) => {
    return new Promise( resolve => {
        snmp.get( oid, function ( error, res ) {
            if ( !error ) {
                if ( mac ) {
                    //caso seja uma ricoh 3500 o serial será o MAC da placa
                    resolve( ( res[ 0 ].value ).toString( 'hex' ).toUpperCase() )
                } else {
                    //remove caractéres inválidos, por exemplo: �
                    resolve( ( res[ 0 ].value + '' ).replace( /[^\w\s]/gi, '' ) )
                }
            } else {
                resolve( null )
            }
        } )
    } )
}

const pegarHtml = ( ip, modelo ) => {
    return new Promise( resolve => {
        axios.request( "http://" + ip + "/DevMgmt/ProductUsageDyn.xml" ).then( ( html ) => {
            if ( modelo.toLowerCase().includes( "m127" ) || modelo.toLowerCase().includes( "m176n" ) ) {
                resolve( html.data.match( /<dd:TotalImpressions>([^<]*)<\/dd:TotalImpressions>/ )[ 1 ] )
            } else if ( modelo.toLowerCase().includes( "8600" ) ) {
                resolve( html.data.match( /<dd:TotalImpressions PEID=\"5082\">([^<]*)<\/dd:TotalImpressions>/ )[ 1 ] )
            }
        } ).catch( err => {
            console.log( "erro ao acessar site de impressora HP no ip ", ip, err )
            resolve( null )
        } )
    } )

}

class Brother extends Impressora {

    constructor( snmp, ip ) {
        super( snmp, ip )
    }

    async pegarDados () {
        this.modelo = await pegarOid( [ "1.3.6.1.2.1.25.3.2.1.3.1" ], this.snmp )
        this.serial = await pegarOid( [ "1.3.6.1.2.1.43.5.1.1.17.1" ], this.snmp )
        this.leitura = await pegarOid( [ "1.3.6.1.2.1.43.10.2.1.4.1.1" ], this.snmp )
    }
}

class Canon extends Impressora {

    constructor( snmp, ip ) {
        super( snmp, ip )
    }

    async pegarDados () {
        this.modelo = await pegarOid( [ "1.3.6.1.2.1.25.3.2.1.3.1" ], this.snmp )
        this.serial = await pegarOid( [ "1.3.6.1.2.1.43.5.1.1.17.1" ], this.snmp )
        this.leitura = await pegarOid( [ "1.3.6.1.2.1.43.10.2.1.4.1.1" ], this.snmp )
    }
}

class Epson extends Impressora {

    constructor( snmp, ip ) {
        super( snmp, ip )
    }

    async pegarDados () {
        this.modelo = await pegarOid( [ "1.3.6.1.2.1.25.3.2.1.3.1" ], this.snmp )
        this.serial = await pegarOid( [ "1.3.6.1.4.1.1248.1.2.2.1.1.1.5.1" ], this.snmp )
        if ( this.serial.includes( "EPSON" ) ) {
            this.serial = await pegarOid( [ "1.3.6.1.4.1.1248.1.2.2.2.1.1.2.1.2" ], this.snmp )
            if ( this.serial.includes( "EPSON" ) ) {
                this.serial = await pegarOid( [ "1.3.6.1.4.1.1248.1.1.3.1.1.33.0" ], this.snmp )
            }
        }
        this.leitura = await pegarOid( [ "1.3.6.1.2.1.43.10.2.1.4.1.1" ], this.snmp )
    }
}

class Hp extends Impressora {

    constructor( snmp, ip ) {
        super( snmp, ip )
    }

    async pegarDados () {
        this.modelo = await pegarOid( [ "1.3.6.1.2.1.25.3.2.1.3.1" ], this.snmp )
        this.serial = await pegarOid( [ "1.3.6.1.4.1.11.2.3.9.4.2.1.1.3.3.0" ], this.snmp )

        if ( this.modelo.toLowerCase().includes( "m127fn" ) || this.modelo.toLowerCase().includes( "8600" ) || this.modelo.toLowerCase().includes( "m176n" ) ) {
            this.leitura = await pegarHtml( this.ip, this.modelo )
        } else {
            this.leitura = await pegarOid( [ "1.3.6.1.2.1.43.10.2.1.4.1.1" ], this.snmp )
        }
    }
}

class Lexmark extends Impressora {

    constructor( snmp, ip ) {
        super( snmp, ip )
    }

    async pegarDados () {
        this.modelo = await pegarOid( [ "1.3.6.1.4.1.641.2.1.2.1.2.1" ], this.snmp )
        this.serial = await pegarOid( [ "1.3.6.1.4.1.641.2.1.2.1.6.1" ], this.snmp )
        this.leitura = await pegarOid( [ "1.3.6.1.2.1.43.10.2.1.4.1.1" ], this.snmp )
    }
}

class Oki extends Impressora {

    constructor( snmp, ip ) {
        super( snmp, ip )
    }

    async pegarDados () {
        this.modelo = await pegarOid( [ "1.3.6.1.2.1.25.3.2.1.3.1" ], this.snmp )
        this.serial = await pegarOid( [ "1.3.6.1.4.1.2001.1.1.1.1.11.1.10.45.0" ], this.snmp )
        this.leitura = await pegarOid( [ "1.3.6.1.4.1.2001.1.1.1.1.11.1.10.170.1.8.1" ], this.snmp )
    }
}

class Ricoh extends Impressora {

    constructor( snmp, ip ) {
        super( snmp, ip )
    }

    async pegarDados () {
        this.modelo = await pegarOid( [ "1.3.6.1.2.1.25.3.2.1.3.1" ], this.snmp )
        this.serial = await pegarOid( [ "1.3.6.1.4.1.367.3.2.1.2.1.4.0" ], this.snmp )

        //remove todos os espaços em branco entre as palavras
        let serial = this.serial.replace( / /g, '' )
        //se o serial estiver em branco, transforma o MAC em serial
        if ( serial === '' || serial.length === 0 ) {
            this.serial = await pegarOid( [ "1.3.6.1.4.1.367.3.2.1.7.2.1.7.1" ], this.snmp, true )
        }

        if ( this.modelo.indexOf( '3500' ) > -1 ) {
            this.leitura = await pegarOid( [ "1.3.6.1.4.1.367.3.2.1.2.19.2.0" ], this.snmp )
        } else {
            // se for a 3510 ou outro modelo de ricoh pega por padrão
            this.leitura = await pegarOid( [ "1.3.6.1.2.1.43.10.2.1.4.1.1" ], this.snmp )
        }
    }
}

class Samsung extends Impressora {

    constructor( snmp, ip ) {
        super( snmp, ip )
    }

    async pegarDados () {
        this.modelo = await pegarOid( [ "1.3.6.1.2.1.25.3.2.1.3.1" ], this.snmp )
        this.serial = await pegarOid( [ "1.3.6.1.4.1.236.11.5.1.1.1.4.0" ], this.snmp )
        this.leitura = await pegarOid( [ "1.3.6.1.2.1.43.10.2.1.4.1.1" ], this.snmp )
    }
}

module.exports = {
    Brother: Brother,
    Canon: Canon,
    Epson: Epson,
    Hp: Hp,
    Lexmark: Lexmark,
    Oki: Oki,
    Ricoh: Ricoh,
    Samsung: Samsung
}
