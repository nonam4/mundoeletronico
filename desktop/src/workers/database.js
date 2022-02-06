import axios from 'axios'
import packageInfo from '../../package.json'

function getRequestSettings ( proxy, endpoint, params ) {
    let requestSettings = {
        url: `http://mundoeletronico.vercel.app/api/coletor/${ endpoint }`,
        params
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

export async function getDados ( { id, local, proxy } ) {

    let params = {
        id: id,
        local: local,
        versao: packageInfo.version,
        os: process.platform
    }

    return await axios.get( getRequestSettings )
}

export async function checkUpdates ( os, versaoLocal ) {
    return await axios.get( '' )
}