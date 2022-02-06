const SNMP = window.require( 'net-snmp' )
import { createLog } from './storage'
import Impressora from './impressoras'

export function verificarIp ( ip ) {
    return new Promise( ( resolve, reject ) => {
        const oid = [ '1.3.6.1.2.1.1.1.0' ]
        const snmp = SNMP.createSession( ip, 'public' )
        snmp.get( oid, ( err, res ) => {

            const query = String( res[ 0 ] ).toLowerCase()

            if ( err ) {
                createLog( `Erro ao verificar fabricante - IP: ${ ip } - Erro: ${ err }` )
                return reject( snmp.close() )
            }

            if ( query.indexOf( 'switch' ) > -1 ) {
                createLog( `Dispositivo encontrado no IP ${ ip } é um Switch e será ignorado - Resultado: ${ query }` )
                return reject( snmp.close() )
            }


            const marca = selecionarMarca( query )
            if ( !marca ) {
                createLog( `Impossível determinar a marca do dispositivo encontrado no IP ${ ip } - Resultado: ${ fabricante }` )
                return reject( snmp.close() )
            }

            const impressora = selecionarImpressora( marca, ip, snmp )
            if ( !impressora ) {
                createLog( `Impossível instanciar impressora do IP ${ ip }` )
                return reject( snmp.close() )
            }

            snmp.close()
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
            return new printers.Canon( snmp, ip )
        case 'epson':
            return new printers.Epson( snmp, ip )
        case 'hp':
            return new printers.Hp( snmp, ip )
        case 'lexmark':
            return new printers.Lexmark( snmp, ip )
        case 'oki':
            return new printers.Oki( snmp, ip )
        case 'ricoh':
            return new printers.Ricoh( snmp, ip )
        case 'samsung':
            return new printers.Samsung( snmp, ip )
        default:
            return undefined
    }
}

