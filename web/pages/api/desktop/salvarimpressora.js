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

            // remove o serial da lista de substituindo
            let index = i.substituindo.indexOf( serial )
            i.substituindo.splice( index, 1 )
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

    // cópia de toda a api getdados com algumas alterações
    // para ver as alterações procure por 'alterações'
    function recalcularDadosLocais ( dados, data ) {
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

        function getDiasPassados ( mes, dia ) {
            let agora = new Date()
            let leitura = new Date( `${ mes }-${ dia }` )

            //se a diferença de dias entre a data da ultima leitura for maior que 5 dias retorna falso
            if ( Math.ceil( Math.abs( agora - leitura ) / ( 1000 * 3600 * 24 ) ) > 5 ) return false
            return true
        }

        //verifica leitura do mes atual e do mes anterior se precisar
        function getMesPassado ( impressora ) {
            let contadores = impressora.contadores[ data ]
            //se o contador do mês for válido e os dias dentro do prazo então está tudo ok
            if ( contadores && getDiasPassados( data, contadores.ultimo.dia ) ) return true

            let split = data.split( '-' )
            let ano = Number( split[ 0 ] )
            let mes = Number( split[ 1 ] ) - 1

            if ( mes < 1 ) ano = ano - 1
            if ( mes < 1 ) mes = 12
            if ( mes < 10 ) mes = `0${ mes }`

            let mesPassado = `${ ano }-${ mes }`
            contadores = impressora.contadores[ mesPassado ]
            //se o contador do mês passado for válido e os dias dentro do prazo então está tudo ok
            if ( contadores && getDiasPassados( mesPassado, contadores.ultimo.dia ) ) return true

            //se os filtros forem diferentes do mês atual
            if ( getDatas()[ 0 ].value != data ) return true

            return false
        }

        function filtrarHistorico ( impressora ) {
            let historico = {}

            function pegarMesAtualAnteriror ( dataHistorico ) {
                let dataMatriz = data.split( '-' ) // separa a data matriz
                let mesAnteriror = Number( dataMatriz[ 1 ] ) - 1 // o mes anterior inicialmente será o mes matriz atual menos 1
                if ( mesAnteriror < 10 ) mesAnteriror = `0${ mesAnteriror }` // se o valor do mes anterior for menor que 10 adiciona o zerio no começo
                if ( Number( dataMatriz[ 1 ] ) <= 1 ) mesAnteriror = 12 // se o valor do mes atual for 1 define o mes anterior como 12

                // se a data atual for igual à data do historico ou se a data do historico for igual à data do mes anterior permite
                return `${ dataHistorico[ 0 ] }-${ dataHistorico[ 1 ] }` === data || `${ dataHistorico[ 0 ] }-${ dataHistorico[ 1 ] }` === `${ dataMatriz[ 0 ] }-${ mesAnteriror }`
            }

            function ordenarHistorico ( desordenado ) {
                const ordenado = Object.keys( desordenado ).sort().reduce( ( obj, key ) => {
                    obj[ key ] = desordenado[ key ]
                    return obj
                }, {} )
                return ordenado
            }

            for ( let id in impressora.historico ) {

                let idHistorico = id.split( ' - ' ) // divide em data e time
                let dataHistorico = idHistorico[ 0 ].split( '.' ) // pega somente a data e divide ela
                if ( pegarMesAtualAnteriror( dataHistorico ) ) historico[ id ] = impressora.historico[ id ]
            }

            return ordenarHistorico( historico )
        }

        // alterações
        let cadastro = JSON.parse( JSON.stringify( dados ) )
        cadastro.impresso = 0
        cadastro.excedentes = 0
        cadastro.excedenteadicional = 0
        cadastro.impressorasAtivas = 0
        cadastro.atraso = false
        cadastro.abastecimento = false

        let impressorasAtrasadas = 0 //variável de controle de impressoras com atrasos em leituras
        let impressoras = cadastro.impressoras
        for ( let serial in impressoras ) {

            let impresso = 0
            let impressora = impressoras[ serial ]
            impressora.serial = impressora.serial.replace( /\(|\)|\-|\s/g, '' ) // remove parenteses, traços e espaços vazios
            if ( !impressora.contabilizar || impressora.substituida || !impressora ) continue //se a impressora estiver substituida, invalida ou não contabilizar pulará para a proxima 
            if ( ( impressora.contador - impressora.tintas.abastecido ) >= impressora.tintas.capacidade ) cadastro.abastecimento = true

            if ( !impressora.contadores ) continue
            let contadores = impressora.contadores[ data ]
            //remove os contadores de outros meses e trabalha apenas com os da data escolhida
            impressora.contadores = { [ data ]: { ...impressora.contadores[ data ] } }
            if ( !contadores ) continue
            if ( !getMesPassado( impressora ) ) impressorasAtrasadas += 1

            cadastro.impressorasAtivas += 1
            //precisa sempre resetar os excedentes dos contadores para evitar bugs ao alterar a franquia no site
            contadores.excedentes = 0
            contadores.adicionaltroca = 0

            if ( impressora.substituindo.length > 0 ) { //essa impressora está substituindo alguma outra?
                for ( let index in impressora.substituindo ) {
                    let serialSubstituido = impressora.substituindo[ index ]
                    let impressoraSubstituida = cadastro.impressoras[ serialSubstituido ]

                    if ( !impressoraSubstituida || !impressoraSubstituida.contadores[ data ] ) continue //se a impressora substituida não existir ou não tiver leitura ela será ignorada

                    impresso += impressoraSubstituida.contadores[ data ].impresso //incrementa com o total impresso das maquinas que sairam
                    contadores.adicionaltroca += impressoraSubstituida.contadores[ data ].impresso
                }
            }

            //após definir o valor impresso pelas maquinas que sairam, incrementamos os valores da impressora atual também
            impresso += contadores.impresso
            //definimos se tem excedentes com base na franquia da maquina comparado ao total impresso das trocas + impresso atual
            if ( impresso > impressora.franquia.limite ) contadores.excedentes = impresso - impressora.franquia.limite
            //incrementa o total impresso no controle geral do cadastro
            cadastro.impresso += impresso
            // adiciona o excedente adicional aos excedentes do cadastro
            if ( contadores.excedenteadicional ) cadastro.excedenteadicional += contadores.excedenteadicional
            switch ( cadastro.franquia.tipo ) {
                case 'maquina':
                    cadastro.excedentes += contadores.excedentes
                    break
                case 'pagina':
                    if ( cadastro.impresso > cadastro.franquia.limite ) cadastro.excedentes = cadastro.impresso - cadastro.franquia.limite
                    break
                case 'ilimitado':
                    cadastro.excedentes = cadastro.impresso
                    break
            }

            // pegará o histórico local dentro da impressora
            // ele já é gravado corretamente e legível
            if ( impressora.historico ) impressora.historico = filtrarHistorico( impressora )
            if ( !impressora.historico ) impressora.historico = {}
        }
        //se apenas uma impressora apenas estiver com atraso não irá dizer que o sistema não está coletando para esse cadastro
        //e não o marcará como um cadastro com atraso, mas se o numero de impressoras ativas for igual que o numero de impressoras
        //atrasadas daí sim irá indicar que não está coletandos
        if ( impressorasAtrasadas >= cadastro.impressorasAtivas ) cadastro.atraso = true
        // alterações
        return cadastro
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
    // atualiza os dados locais
    cadastro = recalcularDadosLocais( cadastro, dataAtual )

    return database.doc( `/cadastros/${ id }` ).set( cadastro, { merge: true } ).then( () => {
        res.status( 200 ).send( { cadastro } )
    } )
}