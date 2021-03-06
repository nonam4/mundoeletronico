import axios from 'axios'

export async function autenticar ( username, password ) {
    return await axios.post( '/api/web/login', { username, password } )
}

export async function getAll () {

}

export async function getImpressoras ( filtros ) {
    const defaults = { listando: 'todos', data: getDatas()[ 0 ].value, busca: '' }
    return await axios.get( '/api/web/getimpressoras', { params: { filtros: filtros || defaults } } )
}

export async function recalcularDados ( data, dados ) {
    return await axios.post( '/api/recalcular', { data, dados } )
}

export async function salvarCadastro ( usuario, alterado ) {
    return await axios.post( '/api/web/salvarcadastro', { usuario, cliente: alterado } )
}

export async function getAtendimentos ( busca ) {
    return await axios.get( '/api/web/getatendimentos', { params: { busca } } )
}

export async function salvarAtendimento ( usuario, atendimento, suprimentos ) {
    return await axios.post( '/api/web/salvaratendimento', { usuario, atendimento, suprimentos } )
}

// não precisa salvar suprimentos, apenas estamos mexendo na ordem dos atendimentos
export async function salvarOrdemAtendimentos ( usuario, atendimentos ) {
    return await axios.post( '/api/web/salvarordematendimentos', { usuario, atendimentos } )
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

export function convertTimestamp ( timestamp ) {
    let data = new Date( timestamp[ '_seconds' ] * 1000 )
    let dia = data.getDate() < 10 ? '0' + data.getDate() : data.getDate()
    let mes = ( data.getMonth() + 1 ) < 10 ? '0' + ( data.getMonth() + 1 ) : data.getMonth() + 1
    let ano = data.getFullYear()

    let hora = data.getHours() < 10 ? '0' + data.getHours() : data.getHours()
    let minutos = data.getMinutes() < 10 ? '0' + data.getMinutes() : data.getMinutes()

    return `${ dia }/${ mes }/${ ano } - ${ hora }:${ minutos }`
}