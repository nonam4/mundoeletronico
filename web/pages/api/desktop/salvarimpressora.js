import database from '../_database.js'
import axios from 'axios'

export default async ( req, res ) => {

    const dataAtual = `${ getData().ano }-${ getData().mes }`
    const { id, dados } = req.body
    const dadosCadastro = await database.doc( `/cadastros/${ id }` ).get()
    const serial = dados.serial.replace( /\(|\)|\-|\s/g, '' ) // remove parenteses, traços e espaços vazios
    const contador = Number( dados.contador )
    let cadastro = dadosCadastro.data()
    let impressoras = cadastro.impressoras

    function getData () {
        const Data = new Date()
        let ano = Data.getFullYear()
        let mes = Data.getMonth() + 1
        let dia = Data.getDate()
        let hora = Data.getHours() - 3 // subtrai 3 que é a diferença de fusu horário do servidor
        let minutos = Data.getMinutes()
        let time = Data.getTime()

        return {
            ano, mes: mes < 10 ? `0${ mes }` : mes, dia: dia < 10 ? `0${ dia }` : dia,
            hora: hora < 10 ? `0${ hora }` : hora, minutos: minutos < 10 ? `0${ minutos }` : minutos, time
        }
    }

    function removerSerialDeListaSubstituindo () {

        for ( let s in impressoras ) {
            let i = impressoras[ s ]
            if ( s === serial ) continue // se os seriais forem iguais então ignora
            if ( i.substituindo.length <= 0 ) continue // se a impressora verificada não substituir nenhuma ignora
            if ( i.substituindo.indexOf( serial ) < 0 ) continue // se a lista de substituições não constar a impressora atual ignora

            console.log( 'lista -> ', i.substituindo, ' - index -> ', i.indexOf( serial ) )
            // remove o serial da lista de substituindo
            let index = i.substituindo.indexOf( serial )
            i.splice( index, 1 )
            // tenha certeza que atualizou no cadastro também
            cadastro.impressoras[ s ] = i
        }
    }

    function calcularMesesFora () {

        function mesesPassados () {

            const split = impressora.vistoporultimo.split( '/' )
            const ultimoMes = new Date( `${ split[ 2 ] }-${ split[ 1 ] }` )
            const mesAtual = new Date( dataAtual )

            // mesAtual.getMonth() - ultimoMes.getMonth()
            // mes atual - ultimo mês = negativo da diferença entre o mes atual (janeiro) e o ultimo mês (outubro) = -9
            // 
            // 12 * ( mesAtual.getFullYear() - ultimoMes.getFullYear() )
            // ano atual - ultimo ano multiplicado por 12 meses = quantos anos passaram -> (2022 - 2021) * 12 = 1 ano passado * 12 = 12 meses passados
            //
            // adiciona os meses passados ao negativo da diferença de meses, assim teremos quantos meses se passaram
            return mesAtual.getMonth() - ultimoMes.getMonth() + ( 12 * ( mesAtual.getFullYear() - ultimoMes.getFullYear() ) )
        }

        // se a impressora estava substituida e voltou agora em um mês novo
        // então não terá nenhum excedente adicional
        // pois a impressora estava fora os contadores voltarão maiores por causa de
        // testes de impressão ou porque outro cliente que usou a máquina
        // essa diferença não pode ser cobrada do cliente e não pode gerar excedentes
        // baseado no último contador registrado
        if ( impressora.substituida ) return 0

        // se a impressora não estava substituida e agora voltou a coletar informações
        // iremos verificar quantos meses ela ficou sem coleta, para cada mês iremos abater
        // a franquia da impressora, Ex: 3 meses sem registro, ultimo contador registrado foi 1000
        // agora a máquina está com 11.000, ou seja, o cliente imprimiu 10.000 folhas em 3 meses
        // franquia da máquina é 3000 -> 3000 x 3 meses fora = 9000 páginas de franquia em 3 meses
        // impresso 10.000 - franquia 9000 = 1000 páginas excedentes para ser acertado
        const franquiaTotalMesesFora = impressora.franquia * mesesPassados() // 9000 páginas
        // quanto foi impresso desde o ultimo contador registrado até o contador atual
        const impressoSemColetar = contador - impressora.contador // 11.000 - 1000 = 10.000 páginas impressas
        // vemos se existe excedente durante o tempo que não foi coletado
        const excedentesSemColetar = impressoSemColetar > franquiaTotalMesesFora ?
            impressoSemColetar - franquiaTotalMesesFora : 0 // 10.000 maior que 9000 então define como 10.000 - 9000 = 1000

        // se existir excedentes durante o tempo sem coletar então retorna o próprio excedente
        if ( excedentesSemColetar > 0 ) return excedentesSemColetar
        // se não existir excedentes durante o tempo sem coletar então retorna zero
        return 0
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
    // se não for para contabilizar a impressora (caso seja particular do cliente ou caso seja de outro fornecedor)
    if ( !impressora.contabilizar ) return res.status( 401 ).send( 'Nenhuma alteração foi feita!' ) // 401 não autorizado

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

    // se a impressora for válida e tiver registro de contador na data de gravação
    if ( impressora.contadores[ dataAtual ] ) {
        // define o quanto foi impresso no mês atual
        let impresso = contador - impressora.contadores[ dataAtual ].primeiro.contador
        let excedentes = impresso > impressora.franquia.limite ? impresso - impressora.franquia.limite : 0

        impressora.contadores = {
            [ dataAtual ]: {
                ...impressora.contadores[ dataAtual ],
                ultimo: {
                    contador, dia: getData().dia
                },
                impresso, excedentes
            }
        }
    }

    // se não tiver nenhum registro de contadores na data de gravação
    if ( !impressora.contadores[ dataAtual ] ) {
        // define o contador inicial para mês atual baseado nos meses sem coleta
        // baseado na franquia da impressora e baseado se a impressora estava substituida ou não
        const excedenteadicional = calcularMesesFora()
        let impresso = 0
        let excedentes = impresso > impressora.franquia.limite ? impresso - impressora.franquia.limite : 0

        impressora.contadores = {
            [ dataAtual ]: {
                primeiro: {
                    contador, dia: getData().dia
                }, ultimo: {
                    contador, dia: getData().dia
                },
                impresso, excedentes
            }
        }
        // se existir excedente adicional define ele no mês contabilizado
        if ( excedenteadicional > 0 ) impressora.contadores[ dataAtual ].excedenteadicional = excedenteadicional
    }

    // define o contador atual da impressora
    impressora.contador = contador
    // remove o serial dela da lista de substituindo de outras impressoras
    if ( impressora.substituida ) removerSerialDeListaSubstituindo( impressora.serial )
    // define que a impressora não está substituida mais
    // pois se o sistema encontrou ela na rede então ela está lá no local
    impressora.substituida = false
    const dataSimples = `${ getData().dia }/${ getData().mes }/${ getData().ano }`
    // se a impressora não tiver registro de instalação, define a data atual
    if ( !impressora.instalada ) impressora.instalada = dataSimples
    // define quando ela foi vista por último no cliente
    impressora.vistoporultimo = dataSimples

    // histórico a ser gravado
    const chave = `${ getData().ano }.${ getData().mes }.${ getData().dia } - ${ getData().hora }:${ getData().minutos }`
    const valor = `${ getData().dia }/${ getData().mes }/${ getData().ano } - ${ getData().hora }:${ getData().minutos }: ${ contador } págs`
    // verifica se a impressora tem registro de histórico, se não cria
    if ( !impressora.historico ) impressora.historico = {}
    impressora.historico = { ...impressora.historico, [ chave ]: valor }

    // somente para ter certeza que alterou os dados na variavel cadastro antes de gravar
    cadastro.impressoras[ serial ] = impressora

    return database.doc( `/cadastros/${ id }` ).set( cadastro, { merge: true } ).then( () => {
        // recalcula os dados para atualizar localmente no cliente
        cadastro = await axios.get( '/api/desktop/getdados', { params: { id: cadastro.id, data: dataAtual } } )
        res.status( 200 ).send( { cadastro } )
    } )
}