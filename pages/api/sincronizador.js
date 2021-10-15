/*
    Sincronização do sitema antigo com o novo
    Se alguma alteração for realizada no sistema antigo ele chamará esse link de API
    que se encarregará de verificar, comparar e atualizar dados correspondentes no novo sistema
*/

import database from './_database.js'
import axios from 'axios'

export default async (req, res) => {

    await axios.request('https://us-central1-ioi-printers.cloudfunctions.net/dados', {
        params: {
            plataforma: 'sync',
            id: req.query.id,
            usuario: process.env.USER,
            senha: process.env.PASS
        }
    }).then(async res => {

        console.log(res.data)

        let velho = res.data.cliente
        if (!velho.ativo) database.doc(`/cadastros/${cliente.id}`).delete() //se o cliente não estiver mais ativo, delete
        let cliente = {}
        let franquia = {}

        cliente.id = velho.id
        cliente.ativo = velho.ativo
        cliente.tipo = 'locacao'
        cliente.contato = velho.contato
        cliente.cpfcnpj = velho.cpfcnpj
        cliente.endereco = velho.endereco
        cliente.nomefantasia = velho.nomefantasia
        cliente.razaosocial = velho.razaosocial
        cliente.sistema = velho.sistema

        cliente.horarios = { segunda: { aberto: false }, terca: { aberto: false }, quarta: { aberto: false }, quinta: { aberto: false }, sexta: { aberto: false }, sabado: { aberto: false } }
        for (let dia in velho.horarios) {
            let horario = velho.horarios[dia]
            let horarios = horario.horario

            if (dia === 'domingo') continue
            if (!horarios) continue

            let a = horarios[0].split(' - ')
            let b = horarios[1].split(' - ')

            cliente.horarios[dia] = {
                aberto: horario.aberto,
                horarios: { 0: a[0], 1: a[1], 2: b[0], 3: b[1] }
            }
        }

        franquia.limite = velho.franquia.valor || 0
        franquia.tipo = velho.franquia.tipo || 'ilimitado'
        franquia.vpe = velho.franquia.preco || 0
        cliente.franquia = franquia

        cliente.sistema.versao = 'N/I'
        if (String(cliente.sistema.versao).toLowerCase() !== 'não instalado') cliente.sistema.versao = '0.1.0'

        cliente.impresso = 0
        cliente.excedentes = 0

        let impressoras = {}
        if (!velho.impressoras) cliente.tipo = 'particular'
        if (velho.fornecedor) cliente.tipo = 'fornecedor'

        if (velho.impressoras && Object.keys(velho.impressoras).length > 0) {
            for (let serial in velho.impressoras) {

                let velha = velho.impressoras[serial]
                if (!velha.ativa) continue
                let impressora = {}
                let franquia = {}

                impressora.contabilizar = velha.ativa
                impressora.serial = serial
                impressora.ip = velha.ip
                impressora.modelo = velha.modelo
                impressora.setor = velha.setor
                impressora.substituida = velha.trocada || false
                impressora.substituindo = []
                if (velha.substituindo) impressora.substituindo.push(velha.substituindo)

                franquia.limite = velha.franquia || 0
                franquia.vpe = velho.franquia.preco || 0
                impressora.franquia = franquia

                impressora.tintas = {
                    capacidade: 0,
                    abastecido: 0
                }
                if (velha.tinta) impressora.tintas = {
                    capacidade: velha.tinta.capacidade,
                    abastecido: velha.tinta.cheio
                }

                impressora.contador = 0
                impressora.contadores = {}
                if (velha.leituras && Object.keys(velha.leituras).length > 0) {
                    for (let key in velha.leituras) {
                        let leitura = velha.leituras[key]

                        //define o contador como o ultimo possível
                        if (leitura.final.valor > impressora.contador) impressora.contador = leitura.final.valor
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
                        if (contadores.impresso > impressora.franquia.limite) contadores.excedentes = contadores.impresso - impressora.franquia.limite
                        switch (cliente.franquia.tipo) {
                            case 'maquina':
                                cliente.excedentes += contadores.excedentes
                                break
                            case 'pagina':
                                if (contadores.impresso > cliente.franquia.limite) cliente.excedentes += contadores.impresso - cliente.franquia.limite
                                break
                            case 'ilimitado':
                                cliente.excedentes = contadores.impresso
                                break
                        }
                        impressora.contadores[key] = contadores
                    }
                }
                impressoras[serial] = impressora
            }
        }
        cliente.impressoras = impressoras
        database.doc(`/cadastros/${cliente.id}`).set(cliente, { merge: true })
        //database.doc(`/cadastros/${cliente.id}`).set(cliente)
    }).catch(err => {
        console.log('erro ao receber ', err)
        res.status(400).send(`Não sincronizou. Usando usuario ${process.env.USER} - erro ${err}`)
    })
    res.status(200).send(`Sincronizado usando usuario ${process.env.USER}`)
}
