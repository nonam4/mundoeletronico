import axios from 'axios'

export function autenticar ( username, password ) {
    return axios.post( '/api/login', { username, password } )
}

export async function getAll () {
    let impressoras = await getImpressoras()
}

export async function getImpressoras ( filters ) {
    const defaults = { listando: 'todos', data: getDatas()[ 0 ].value }
    return await axios.get( '/api/getimpressoras', { params: { filters: filters || defaults } } )
}

function getDatas () {
    let datas = []
    let data = new Date()
    let ano = data.getFullYear()
    let mes = data.getMonth() + 1

    for ( var x = 0; x < 4; x++ ) {
        datas.push( { value: ano + '-' + ( mes < 10 ? `0${ mes }` : mes ), label: ( mes < 10 ? `0${ mes }` : mes ) + '/' + ano } )

        if ( mes <= 1 ) {
            mes = 12
            ano = ano - 1
        } else {
            mes--
        }
    }
    return datas
}