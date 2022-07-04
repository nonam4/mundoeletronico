/*
    Sincronização do sitema antigo com o novo
    Se alguma alteração for realizada no sistema antigo ele chamará esse link de API
    que se encarregará de verificar, comparar e atualizar dados correspondentes no novo sistema
*/

import database from './_database.js'

export default async ( req, res ) => {
    const dadosDesktop = await database.doc( '/sistema/desktop/' ).get()
    let versao = dadosDesktop.data().versaoatual

    let velho = req.body.cliente
    let cadastro = {}

    console.log( `sincronizando cliente ID ${ velho.id }` )

    // se o cadastro velho não estiver mais ativo
    if ( !velho.ativo ) return await database.doc( `/cadastros/${ velho.id }` ).delete() //se o cadastro não estiver mais ativo, delete

    cadastro.id = velho.id
    cadastro.ativo = velho.ativo
    cadastro.contato = velho.contato
    cadastro.cpfcnpj = velho.cpfcnpj
    cadastro.endereco = velho.endereco
    cadastro.nomefantasia = velho.nomefantasia
    cadastro.razaosocial = velho.razaosocial

    cadastro.tipo = 'locacao'
    cadastro.sistema = velho.sistema
    // 'Ti9J' = N/I já convertido em Base64
    if ( !velho.sistema || String( velho.sistema.versao ).toLowerCase() === 'não instalado' ) cadastro.sistema.versao = 'Ti9J'
    if ( String( velho.sistema.versao ).toLowerCase() !== 'não instalado' ) cadastro.sistema.versao = versao

    // define os horários para o novo sistema com base nos horários antigos cadastrados
    cadastro.horarios = { segunda: { aberto: false }, terca: { aberto: false }, quarta: { aberto: false }, quinta: { aberto: false }, sexta: { aberto: false }, sabado: { aberto: false } }
    for ( let dia in velho.horarios ) {
        let horario = velho.horarios[ dia ]
        let horarios = horario.horario

        if ( dia === 'domingo' ) continue
        if ( !horarios ) continue

        let a = horarios[ 0 ].split( ' - ' )
        let b = horarios[ 1 ].split( ' - ' )

        cadastro.horarios[ dia ] = {
            aberto: horario.aberto,
            horarios: { 0: a[ 0 ], 1: a[ 1 ], 2: b[ 0 ], 3: b[ 1 ] }
        }
    }

    // atualiza as franquias para o novo formato
    cadastro.franquia = {
        limite: velho.franquia.valor || 0,
        tipo: velho.franquia.tipo || 'ilimitado',
        vpe: velho.franquia.preco || 0
    }

    cadastro.impresso = 0
    cadastro.excedentes = 0

    let impressoras = {}
    if ( velho.fornecedor ) cadastro.tipo = 'fornecedor'
    if ( !velho.impressoras ) cadastro.tipo = 'particular'

    if ( velho.impressoras && Object.keys( velho.impressoras ).length > 0 ) {
        for ( let serial in velho.impressoras ) {

            let velha = velho.impressoras[ serial ]
            if ( !velha.ativa ) continue

            let impressora = {}

            // limpa o serial mas tenha certeza que não será passado nenhum serial vazio
            const replaced = serial.replace( /\(|\)|\-|\s/g, '' )
            impressora.serial = replaced === '' ? serial : replaced
            impressora.modelo = velha.modelo
            impressora.ip = velha.ip
            impressora.contabilizar = velha.ativa
            impressora.setor = velha.setor
            impressora.substituida = velha.trocada || false
            impressora.substituindo = []
            if ( velha.substituindo ) impressora.substituindo.push( velha.substituindo )

            impressora.franquia = {
                limite: velha.franquia || 0,
                vpe: velho.franquia.preco || 0
            }

            if ( velha.tinta ) impressora.tintas = {
                capacidade: velha.tinta.capacidade || 0,
                abastecido: velha.tinta.cheio || 0
            }

            impressora.contador = 0
            impressora.contadores = {}

            if ( velha.leituras && Object.keys( velha.leituras ).length > 0 ) {

                const leiturasOrdenadas = Object.keys( velha.leituras ).sort().reduce( ( obj, key ) => {
                    obj[ key ] = velha.leituras[ key ]
                    return obj
                }, {} )

                // define a data de instalação
                let primeiraChave = Object.keys( leiturasOrdenadas )[ 0 ]
                let primeiraLeitura = velha.leituras[ primeiraChave ]
                let primeiroAnoMes = primeiraChave.split( '-' )

                impressora.instalada = `${ primeiraLeitura.inicial.dia }/${ primeiroAnoMes[ 1 ] }/${ primeiroAnoMes[ 0 ] }`

                // define o visto por ultimo
                let ultimaChave = Object.keys( leiturasOrdenadas )[ Object.keys( leiturasOrdenadas ).length - 1 ]
                let ultimaLeitura = velha.leituras[ ultimaChave ]
                let ultimoAnoMes = ultimaChave.split( '-' )

                impressora.vistoporultimo = `${ ultimaLeitura.final.dia }/${ ultimoAnoMes[ 1 ] }/${ ultimoAnoMes[ 0 ] }`

                // define o contador como o ultimo possível
                impressora.contador = ultimaLeitura.final.valor

                for ( let key in velha.leituras ) {
                    let leitura = velha.leituras[ key ]
                    let contadores = {}

                    contadores.primeiro = {
                        contador: leitura.inicial.valor,
                        dia: leitura.inicial.dia
                    }

                    contadores.ultimo = {
                        contador: leitura.final.valor,
                        dia: leitura.final.dia
                    }

                    contadores.impresso = leitura.final.valor - leitura.inicial.valor
                    impressora.contadores[ key ] = contadores
                }
            }
            impressoras[ impressora.serial ] = impressora
        }
    }
    cadastro.impressoras = impressoras
    await database.doc( `/cadastros/${ cadastro.id }` ).set( cadastro, { merge: true } ).then( () => {
        res.status( 200 ).send( 'Sincronizado' )
    } )
}

