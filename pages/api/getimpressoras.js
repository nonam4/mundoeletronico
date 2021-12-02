import database from './_database.js'

export default async ( req, res ) => {

    const { data, listando } = JSON.parse( req.query.filtros )

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

    let clientes = {}
    let historico = {}
    let dados = await database.collection( '/cadastros/' ).where( 'ativo', '==', true ).where( 'tipo', '==', 'locacao' ).orderBy( 'nomefantasia' ).get()
    let listaHistorico = await database.collection( '/historico' ).get()

    listaHistorico.forEach( itemHistorico => {
        let serial = itemHistorico.id.replace( /\(|\)|\-|\s/g, '' ) // remove parenteses, traços e espaços vazios
        let dadosHistorico = itemHistorico.data()

        historico[ serial ] = {}

        function pegarMesAtualAnteriror ( dataHistorico ) {

            let dataMatriz = data.split( '-' ) // separa a data matriz em numeros separados

            let mesAnteriror = Number( dataMatriz[ 1 ] ) - 1 // o mes anterior inicialmente será o mes matriz atual menos 1
            if ( mesAnteriror < 10 ) mesAnteriror = `0${ mesAnteriror }` // se o valor do mes anterior for menor que 10 adiciona o zerio no começo
            if ( Number( dataMatriz[ 1 ] ) <= 1 ) mesAnteriror = 12 // se o valor do mes atual for 1 define o mes anterior como 12

            // se a data atual for igual à data do historico ou se a data do historico for igual à data do mes anterior permite
            if ( `${ dataHistorico[ 0 ] }-${ dataHistorico[ 1 ] }` === data || `${ dataHistorico[ 0 ] }-${ dataHistorico[ 1 ] }` === `${ dataMatriz[ 0 ] }-${ mesAnteriror }` ) return true
            return false
        }

        for ( let linhaHistorico in dadosHistorico.contadores ) {

            let idHistorico = linhaHistorico.split( ' - ' )
            let dataHistorico = idHistorico[ 0 ].split( '.' )
            let horarioHistorico = new Date( Number( idHistorico[ 1 ] ) )

            let horaHistorico = horarioHistorico.getHours()
            if ( horaHistorico < 10 ) horaHistorico = `0${ horaHistorico }`
            let minutosHistorico = horarioHistorico.getMinutes()
            if ( minutosHistorico < 10 ) minutosHistorico = `0${ minutosHistorico }`

            if ( pegarMesAtualAnteriror( dataHistorico ) ) historico[ serial ][ linhaHistorico ] = `${ dataHistorico[ 2 ] }/${ dataHistorico[ 1 ] }/${ dataHistorico[ 0 ] } - ${ horaHistorico }:${ minutosHistorico }: ${ dadosHistorico.contadores[ linhaHistorico ] } págs`
        }
    } )

    dados.forEach( dado => {

        let cliente = dado.data()
        cliente.impresso = 0
        cliente.excedentes = 0
        cliente.impressorasAtivas = 0
        cliente.atraso = false
        cliente.abastecimento = false

        let impressorasAtrasadas = 0 //variável de controle de impressoras com atrasos em leituras
        let impressoras = cliente.impressoras
        for ( let serial in impressoras ) {

            let impressora = impressoras[ serial ]
            impressora.contadores = { [ data ]: dado.data().impressoras[ serial ].contadores[ data ] } //define assim para não passar excesso de dados pro cliente
            let contadores = impressora.contadores[ data ]
            let impresso = 0
            if ( !impressora.contabilizar || impressora.substituida || !impressora ) continue //se a impressora estiver substituida, invalida ou não contabilizar pulará para a proxima            
            if ( ( impressora.contador - impressora.tintas.abastecido ) >= impressora.tintas.capacidade ) cliente.abastecimento = true
            if ( !getMesPassado( impressora ) ) impressorasAtrasadas += 1

            cliente.impressorasAtivas += 1

            if ( !contadores ) continue
            //precisa sempre resetar os excedentes dos contadores para evitar bugs ao alterar a franquia no site
            contadores.excedentes = 0
            contadores.adicionaltroca = 0

            if ( impressora.substituindo.length > 0 ) { //essa impressora está substituindo alguma outra?
                for ( let index in impressora.substituindo ) {
                    let serialSubstituido = impressora.substituindo[ index ]
                    let impressoraSubstituida = cliente.impressoras[ serialSubstituido ]

                    if ( !impressoraSubstituida || !impressoraSubstituida.contadores[ data ] ) continue //se a impressora substituida não existir ou não tiver leitura ela será ignorada

                    impresso += impressoraSubstituida.contadores[ data ].impresso //incrementa com o total impresso das maquinas que sairam
                    contadores.adicionaltroca += impressoraSubstituida.contadores[ data ].impresso
                }
            }

            //após definir o valor impresso pelas maquinas que sairam, incrementamos os valores da impressora atual também
            impresso += contadores.impresso
            //definimos se tem excedentes com base na franquia da maquina comparado ao total impresso das trocas + impresso atual
            if ( impresso > impressora.franquia.limite ) contadores.excedentes = impresso - impressora.franquia.limite
            //incrementa o total impresso no controle geral do cliente
            cliente.impresso += impresso

            switch ( cliente.franquia.tipo ) {
                case 'maquina':
                    cliente.excedentes += contadores.excedentes
                    break
                case 'pagina':
                    if ( cliente.impresso > cliente.franquia.limite ) cliente.excedentes = cliente.impresso - cliente.franquia.limite
                    break
                case 'ilimitado':
                    cliente.excedentes = cliente.impresso
                    break
            }
        }
        //se apenas uma impressora apenas estiver com atraso não irá dizer que o sistema não está coletando para esse cliente
        //e não o marcará como um cliente com atraso, mas se o numero de impressoras ativas for igual que o numero de impressoras
        //atrasadas daí sim irá indicar que não está coletandos
        if ( impressorasAtrasadas >= cliente.impressorasAtivas ) cliente.atraso = true

        switch ( listando ) {
            case 'todos':
                clientes[ cliente.id ] = cliente
                break
            case 'excedentes':
                if ( cliente.excedentes > 0 ) clientes[ cliente.id ] = cliente
                break
            case 'atrasos':
                if ( cliente.atraso ) clientes[ cliente.id ] = cliente
                break
            case 'abastecimentos':
                if ( cliente.abastecimento ) clientes[ cliente.id ] = cliente
                break
        }
    } )
    //define que os dados ficarão em cache por no minimo 60 segundos, depois revalida tudo novamente
    if ( process.env.NODE_ENV === 'development' ) res.setHeader( 'Cache-Control', 's-maxage=60000, stale-while-revalidade' )
    res.status( 200 ).send( { clientes, historico } )
}