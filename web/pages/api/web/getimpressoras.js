import database from '../_database.js'

export default async ( req, res ) => {

    const { data, listando } = JSON.parse( req.query.filtros )
    const listaCadastros = await database.collection( '/cadastros/' ).where( 'ativo', '==', true ).where( 'tipo', '==', 'locacao' ).orderBy( 'nomefantasia' ).get()

    let cadastros = { locacao: {} }

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

    listaCadastros.forEach( itemCadastro => {

        let cadastro = itemCadastro.data()

        cadastro.impresso = 0
        cadastro.excedentes = 0
        cadastro.excedenteadicional = 0
        cadastro.impressorasAtivas = 0
        cadastro.atraso = false
        cadastro.abastecimento = false

        let impressorasAtrasadas = 0 //variável de controle de impressoras com atrasos em leituras
        let impressoras = cadastro.impressoras
        for ( let serial in impressoras ) {

            let impressora = impressoras[ serial ]
            impressora.serial = impressora.serial.replace( /\(|\)|\-|\s/g, '' ) // remove parenteses, traços e espaços vazios
            //impressora.contadores = { [ data ]: itemCadastro.data().impressoras[ serial ].contadores[ data ] } //define assim para não passar excesso de dados pro cadastro
            let contadores = impressora.contadores[ data ]
            let impresso = 0
            if ( !impressora.contabilizar || impressora.substituida || !impressora ) continue //se a impressora estiver substituida, invalida ou não contabilizar pulará para a proxima            
            if ( ( impressora.contador - impressora.tintas.abastecido ) >= impressora.tintas.capacidade ) cadastro.abastecimento = true
            if ( !getMesPassado( impressora ) ) impressorasAtrasadas += 1

            cadastro.impressorasAtivas += 1

            if ( !contadores ) continue
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

            //remove os contadores de outros meses e trabalha apenas com os da data escolhida
            impressora.contadores = { [ data ]: { ...contadores } }

            // pegará o histórico local dentro da impressora
            // ele já é gravado corretamente e legível
            if ( impressora.historico ) impressora.historico = filtrarHistorico( impressora )
            if ( !impressora.historico ) impressora.historico = {}
        }
        //se apenas uma impressora apenas estiver com atraso não irá dizer que o sistema não está coletando para esse cadastro
        //e não o marcará como um cadastro com atraso, mas se o numero de impressoras ativas for igual que o numero de impressoras
        //atrasadas daí sim irá indicar que não está coletandos
        if ( impressorasAtrasadas >= cadastro.impressorasAtivas ) cadastro.atraso = true

        switch ( listando ) {
            case 'todos':
                cadastros[ 'locacao' ][ cadastro.id ] = cadastro
                break
            case 'excedentes':
                if ( cadastro.excedentes > 0 ) cadastros[ 'locacao' ][ cadastro.id ] = cadastro
                break
            case 'atrasos':
                if ( cadastro.atraso ) cadastros[ 'locacao' ][ cadastro.id ] = cadastro
                break
            case 'abastecimentos':
                if ( cadastro.abastecimento ) cadastros[ 'locacao' ][ cadastro.id ] = cadastro
                break
        }
    } )

    res.status( 200 ).send( { cadastros } )
}