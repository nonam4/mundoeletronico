import database from '../_database.js'

export default async ( req, res ) => {

    const dataAtual = `${ getData().ano }-${ getData().mes }`
    const { id, dados } = req.body
    const dadosCadastro = await database.doc( `/cadastros/${ id }` ).get()
    const serial = dados.serial.replace( /\(|\)|\-|\s/g, '' ) // remove parenteses, traços e espaços vazios
    const contador = Number( dados.contador )
    let cadastro = dadosCadastro.data()
    let impressoras = cadastro.impressoras

    // se o cadastro não estiver ativo não fará mais nada
    if ( !cadastro.ativo ) return res.status( 202 ).send( 'Nenhuma alteração foi feita!' )

    function getData () {
        const data = new Date()
        let ano = data.getFullYear()
        let mes = data.getMonth() + 1
        let dia = data.getDate()
        let time = data.getTime()

        return { ano, mes: mes < 10 ? `0${ mes }` : mes, dia: dia < 10 ? `0${ dia }` : dia, time }
    }

    // se a impressora for nova
    if ( !impressoras[ serial ] ) {
        impressoras[ serial ] = {
            contabilizar: true, contador,
            contadores: {
                [ dataAtual ]: {
                    primeiro: {
                        contador, dia: getData().dia
                    }, ultimo: {
                        contador, dia: getData().dia
                    },
                    impresso: 0, excedentes: 0
                }
            }, franquia: {
                limite: 0,
                vpe: 0
            },
            ip: dados.ip,
            modelo: dados.modelo, serial,
            setor: 'Não informado',
            substituindo: [],
            tintas: {
                abastecido: Number( dados.contador ),
                capacidade: 'ilimitado'
            }
        }
    }

    // define a impressora local
    let impressora = impressoras[ serial ]
    impressora.contador = contador

    // se não tiver nenhum registro de contadores
    if ( !impressora.contadores ) {
        impressora.contadores = {
            [ dataAtual ]: {
                primeiro: {
                    contador, dia: getData().dia
                }, ultimo: {
                    contador, dia: getData().dia
                },
                impresso: 0, excedentes: 0
            }
        }
    }

    // se não tiver nenhum registro de contadores na data de gravação
    if ( !impressora.contadores[ dataAtual ] ) {
        // define o quanto foi impresso no mês atual
        let impresso = contador - impressora.contador
        let excedentes = impresso > impressora.franquia.limite ? impresso - impressora.franquia.limite : 0

        impressora.contadores = {
            [ dataAtual ]: {
                primeiro: {
                    contador: impressora.contador,
                    dia: getData().dia
                }, ultimo: {
                    contador, dia: getData().dia
                },
                impresso, excedentes
            }
        }
    }

    // se a impressora for válida e tiver registro de contador na data de gravação
    if ( impressora.contadores[ dataAtual ] ) {
        // define o quanto foi impresso no mês atual
        let impresso = contador - impressora.contadores[ dataAtual ].primeiro.contador
        let excedentes = impresso > impressora.franquia.limite ? impresso - impressora.franquia.limite : 0

        impressora.contadores = {
            ...impressora.contadores,
            [ dataAtual ]: {
                ultimo: {
                    contador, dia: getData().dia
                },
                impresso, excedentes
            }
        }
    }

    // somente para ter certeza que alterou os dados na variavel cadastro antes de gravar
    cadastro.impressoras[ serial ] = impressora

    const chave = `${ getData().ano }.${ getData().mes }.${ getData().dia } - ${ getData().time }`
    await database.doc( `/historico/${ serial }` ).set( {
        contadores: { [ chave ]: Number( impressora.contador ) },
        modelo: impressora.modelo, usuarioAtual: `${ id } - ${ cadastro.nomefantasia }`
    }, { merge: true } )

    return database.doc( `/cadastros/${ id }` ).set( cadastro, { merge: true } ).then( () => {
        res.status( 200 ).send( 'Salvo' )
    } )
}