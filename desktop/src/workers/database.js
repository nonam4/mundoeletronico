import axios from 'axios'
import packageInfo from '../../package.json'

export async function pegarDados ( { id, local, proxy } ) {

    let reqSettings = {
        url: 'http://mundoeletronico.vercel.app/api/coletor/getdados',
        params: {
            id: id,
            local: local,
            versao: packageInfo.version,
            os: process.platform
        }
    }
    if ( proxy.active ) {
        reqSettings.proxy = {
            host: proxy.host,
            port: proxy.port,
            auth: {
                username: proxy.user,
                password: proxy.pass
            }
        }
    }

    return await axios.get( reqSettings )
}