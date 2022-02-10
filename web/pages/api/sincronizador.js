/*
    Sincronização do sitema antigo com o novo
    Se alguma alteração for realizada no sistema antigo ele chamará esse link de API
    que se encarregará de verificar, comparar e atualizar dados correspondentes no novo sistema
*/

import database from './_database.js'

export default async ( req, res ) => {

    let { chave, leitura } = req.body
    //if ( serial && chave && leitura && modelo ) database.doc( `/historico/${ serial }` ).set( { contadores: { [ chave ]: leitura }, modelo, usuarioAtual: `${ id } - ${ velho.nomefantasia }` }, { merge: true } )
    let velho = req.body.cliente

    if ( !velho.ativo ) return database.doc( `/cadastros/${ velho.id }` ).delete() //se o cliente não estiver mais ativo, delete
    let cliente = {}
    let franquia = {}

    function getData () {
        const Date = new Date()
        let ano = Date.getFullYear()
        let mes = Date.getMonth() + 1
        let dia = Date.getDate()
        let hora = Date.getHours()
        let minutos = Date.getMinutes()
        let time = Date.getTime()

        return {
            ano, mes: mes < 10 ? `0${ mes }` : mes, dia: dia < 10 ? `0${ dia }` : dia,
            hora: hora < 10 ? `0${ hora }` : hora, minutos: minutos < 10 ? `0${ minutos }` : minutos, time
        }
    }

    cliente.id = velho.id
    cliente.ativo = velho.ativo
    cliente.tipo = 'locacao'
    cliente.contato = velho.contato
    cliente.cpfcnpj = velho.cpfcnpj
    cliente.endereco = velho.endereco
    cliente.nomefantasia = velho.nomefantasia
    cliente.razaosocial = velho.razaosocial

    cliente.sistema = velho.sistema
    // 'Ti9J' = N/I já convertido em Base64
    if ( !velho.sistema || String( velho.sistema.versao ).toLowerCase() === 'não instalado' ) cliente.sistema.versao = 'Ti9J'

    cliente.horarios = { segunda: { aberto: false }, terca: { aberto: false }, quarta: { aberto: false }, quinta: { aberto: false }, sexta: { aberto: false }, sabado: { aberto: false } }

    franquia.limite = velho.franquia.valor || 0
    franquia.tipo = velho.franquia.tipo || 'ilimitado'
    franquia.vpe = velho.franquia.preco || 0
    cliente.franquia = franquia

    cliente.impresso = 0
    cliente.excedentes = 0

    let impressoras = {}
    if ( !velho.impressoras ) cliente.tipo = 'particular'
    if ( velho.fornecedor ) cliente.tipo = 'fornecedor'

    if ( velho.impressoras && Object.keys( velho.impressoras ).length > 0 ) {
        for ( let serial in velho.impressoras ) {

            let velha = velho.impressoras[ serial ]
            if ( !velha.ativa ) continue
            let impressora = {}

            impressora.contabilizar = velha.ativa
            impressora.serial = serial
            impressora.ip = velha.ip
            impressora.modelo = velha.modelo
            impressora.setor = velha.setor
            impressora.substituida = velha.trocada || false
            impressora.substituindo = []
            if ( velha.substituindo ) impressora.substituindo.push( velha.substituindo )

            impressora.franquia = {
                limite: velha.franquia || 0,
                vpe: velho.franquia.preco || 0
            }

            impressora.tintas = {
                capacidade: 0,
                abastecido: 0
            }
            if ( velha.tinta ) impressora.tintas = {
                capacidade: velha.tinta.capacidade,
                abastecido: velha.tinta.cheio
            }

            if ( chave && leitura ) {
                const valor = `${ getData().dia }/${ getData().mes }/${ getData().ano } - ${ getData().hora }:${ getData().minutos }: ${ leitura } págs`
                impressora.historico = {
                    [ chave ]: valor
                }
            }

            impressora.contador = 0
            impressora.contadores = {}
            if ( velha.leituras && Object.keys( velha.leituras ).length > 0 ) {
                for ( let key in velha.leituras ) {
                    let leitura = velha.leituras[ key ]

                    //define o contador como o ultimo possível
                    if ( leitura.final.valor > impressora.contador ) impressora.contador = leitura.final.valor
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
                    contadores.excedentes = 0
                    if ( contadores.impresso > impressora.franquia.limite ) contadores.excedentes = contadores.impresso - impressora.franquia.limite
                    switch ( cliente.franquia.tipo ) {
                        case 'maquina':
                            cliente.excedentes += contadores.excedentes
                            break
                        case 'pagina':
                            if ( contadores.impresso > cliente.franquia.limite ) cliente.excedentes += contadores.impresso - cliente.franquia.limite
                            break
                        case 'ilimitado':
                            cliente.excedentes = contadores.impresso
                            break
                    }
                    impressora.contadores[ key ] = contadores
                }
            }
            impressoras[ serial ] = impressora
        }
    }
    cliente.impressoras = impressoras
    database.doc( `/cadastros/${ cliente.id }` ).set( cliente, { merge: true } )

    res.status( 200 ).send( 'Sincronizado' )
}

