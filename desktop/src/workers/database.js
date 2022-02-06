import axios from 'axios'

function getRequestSettings ( method, endpoint, params, proxy ) {
    let requestSettings = {
        url: `http://mundoeletronico.vercel.app/api/desktop/${ endpoint }`,
        method, params: { ...params }
    }

    // se o proxy não estiver ativo já retorna
    if ( proxy.active ) requestSettings.proxy = {
        host: proxy.host,
        port: proxy.port,
        auth: {
            username: proxy.user,
            password: proxy.pass
        }
    }
    return requestSettings
}

export async function getDados ( id, data, proxy ) {
    return await axios.request( getRequestSettings( 'get', 'getdados', { id, data }, proxy ) )
}

export async function checkUpdates ( os, versaoLocal, proxy ) {
    return await axios.request( getRequestSettings( 'get', 'checkupdates', { os, versaoLocal }, proxy ) )
}

export async function salvarImpressora ( id, dados, proxy ) {
    return await axios.request( getRequestSettings( 'post', 'salvarimpressora', { id, dados }, proxy ) )
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