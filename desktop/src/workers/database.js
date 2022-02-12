import axios from 'axios'
import packageInfo from '../../package.json'

const versao = packageInfo.version

function getRequestSettings ( method, endpoint, params, proxy, username, password, host, port ) {
    let requestSettings = { url: `http://mundoeletronico.vercel.app/api/desktop/${ endpoint }`, method }
    // se o proxy não estiver ativo já retorna
    if ( proxy ) requestSettings.proxy = {
        host, port,
        auth: { username, password }
    }

    if ( method === 'get' ) requestSettings.params = { ...params }
    if ( method === 'post' ) requestSettings.data = params

    return requestSettings
}

export async function getDados ( id, data, proxy, user, pass, host, port ) {
    return await axios.request( getRequestSettings( 'get', 'getdados', { id, data }, proxy, user, pass, host, port ) )
}

export async function checkUpdates ( os, local, id, proxy, user, pass, host, port ) {
    return await axios.request( getRequestSettings( 'get', 'checkupdates', { os, versao, local, id }, proxy, user, pass, host, port ) )
}

export async function salvarImpressora ( id, dados, proxy, user, pass, host, port ) {
    return await axios.request( getRequestSettings( 'post', 'salvarimpressora', { id, dados }, proxy, user, pass, host, port ) )
}

export function getDatas () {
    let datas = []
    let data = new Date()
    let ano = data.getFullYear()
    let mes = data.getMonth() + 1

    for ( let x = 0; x < 4; x++ ) {
        datas.push( { value: `${ ano }-${ ( mes < 10 ? `0${ mes }` : mes ) }`, label: `${ ( mes < 10 ? `0${ mes }` : mes ) }/${ ano }` } )

        // se o mes for maior que 1 apenas reduza um
        if ( mes > 1 ) {
            mes--
            continue
        }
        // caso contrário define um novo ciclo
        mes = 12
        ano = ano - 1
    }
    return datas
}