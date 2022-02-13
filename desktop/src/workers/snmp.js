import * as Impressora from './impressoras'
import { createLog } from './storage'
const SNMP = window.require( 'net-snmp' )

export function verificarIp ( ip ) {
    return new Promise( ( resolve, reject ) => {
        const oid = [ '1.3.6.1.2.1.1.1.0' ]
        const snmp = SNMP.createSession( ip, 'public' )
        snmp.get( oid, ( err, res ) => {

            if ( err ) {
                // se der erro por timout não cria log 
                //pois significa que  o ip está vazio
                if ( err.name === 'RequestTimedOutError' || String( err ) === 'Error: Socket forcibly closed' ) return reject( snmp.close() )
                createLog( `Erro ao verificar fabricante - IP: ${ ip } - Erro: ${ err }` )
                return reject( snmp.close() )
            }

            const query = `${ res[ 0 ].value }`.toLowerCase()
            if ( query.indexOf( 'switch' ) > -1 ) {
                createLog( `Dispositivo encontrado no IP ${ ip } é um Switch e será ignorado - Resultado: ${ query }` )
                return reject( snmp.close() )
            }

            const marca = selecionarMarca( query )
            if ( !marca ) {
                createLog( `Impossível determinar a marca do dispositivo encontrado no IP ${ ip } - Resultado: ${ marca }` )
                return reject( snmp.close() )
            }

            const impressora = selecionarImpressora( marca, ip, snmp )
            if ( !impressora ) {
                createLog( `Impossível instanciar impressora do IP ${ ip }` )
                return reject( snmp.close() )
            }

            resolve( impressora )
        } )
    } )
}

function selecionarMarca ( fabricante ) {
    var marcas = [ 'brother', 'canon', 'epson', 'hp', 'lexmark', 'oki', 'ricoh', 'samsung' ]

    for ( let marca of marcas ) {
        if ( fabricante.indexOf( marca ) > -1 ) return marca
    }
    return undefined
}

function selecionarImpressora ( marca, ip, snmp ) {
    switch ( marca ) {
        case 'brother':
            return new Impressora.Brother( snmp, ip )
        case 'canon':
            return new Impressora.Canon( snmp, ip )
        case 'epson':
            return new Impressora.Epson( snmp, ip )
        case 'hp':
            return new Impressora.Hp( snmp, ip )
        case 'lexmark':
            return new Impressora.Lexmark( snmp, ip )
        case 'oki':
            return new Impressora.Oki( snmp, ip )
        case 'ricoh':
            return new Impressora.Ricoh( snmp, ip )
        case 'samsung':
            return new Impressora.Samsung( snmp, ip )
        default:
            return undefined
    }
}

