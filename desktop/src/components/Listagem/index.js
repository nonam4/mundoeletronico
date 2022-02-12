import { useEffect, useState } from 'react'
import { createLog } from '../../workers/storage'
import { useTela } from '../../contexts/TelaContext'
import { useDados } from '../../contexts/DadosContext'

import * as Database from '../../workers/database'
import * as Notification from '../../workers/notification'
import * as SNMP from '../../workers/snmp'
import * as DHCP from '../../workers/dhcp'

import TelaListagem from './TelaListagem'

function Listagem () {
    const currentWindow = window.require( '@electron/remote' ).getCurrentWindow()
    const tela = useTela()
    const dados = useDados()

    useEffect( () => {
        // inicia o loop principal do sistema
        loop()
        handleWindowClose()
        criarTray()
    }, [] )

    function handleWindowClose () {
        // cuida para que não feche a janela enquanto não preencher os dados
        currentWindow.on( 'close', () => {
            currentWindow.hide()
            criarTray()
            return false
        } )
    }

    function criarTray () {
        // cria o ícone na tray do sistema se a janela não estiver visível
        if ( currentWindow.isVisible() ) return
        window.require( '@electron/remote' ).require( './electron.js' ).criarTray()
    }

    function setLoad ( valor ) {
        tela.dispatch( { type: 'setLoad', payload: valor } )
    }

    function setUpdate ( valor ) {
        setLoad( false )
        tela.dispatch( { type: 'setUpdate', payload: valor } )
    }

    function setCadastro ( dados ) {
        tela.dispatch( { type: 'setCadastro', payload: dados } )
    }

    function setHistorico ( dados ) {
        tela.dispatch( { type: 'setHistorico', payload: dados } )
    }

    // loop principal do sistema, a cada hora irá realizar a mesma ação novamente
    function loop () {
        getDados( Database.getDatas()[ 0 ].value )
        setTimeout( () => {
            loop()
        }, 3600000 )
    }

    function getDados ( data ) {
        // não precisa verificar qual o código de erro
        // se o cadastro não existir ou não estiver ativo irá retornar erro 40x
        // esse erro já vai direto para o catch
        Database.getDados( dados.state.id, data, dados.state.proxy,
            dados.state.user, dados.state.pass, dados.state.host, dados.state.port ).then( res => {
                setHistorico( res.data.historico )
                setCadastro( res.data.cadastro )
                // se o cadastro for válido busque por atualizações do sistema
                checkUpdates()
            } ).catch( err => {
                // em caso de erro ao buscar atualizações
                Notification.notificate( 'Erro', 'Cadastro inativo ou inexistente', 'danger' )
                createLog( `Cadastro inativo ou inexistente -> ${ err }` )
                console.error( err )
                // se o erro for 404 é porque o cadastro não foi encontrado ou foi excluido
                // nesse caso iremos remover a ID dos arquivos locais
                if ( err.response.status === 404 ) return dados.dispatch( { type: 'setId', payload: '' } )
                setLoad( false )
            } )
    }

    function checkUpdates () {
        Database.checkUpdates( process.platform, window.btoa( dados.state.local ), dados.state.id, dados.state.proxy,
            dados.state.user, dados.state.pass, dados.state.host, dados.state.port ).then( res => {
                // se a url de update estiver presente irá atualizar
                if ( res.data.updateUrl ) return selfUpdate( res.data.updateUrl )
                // se não precisar atualizar
                buscarImpressoras()
            } ).catch( err => {
                // em caso de erro ao buscar atualizações
                Notification.notificate( 'Erro', 'Impossível verificar por atualizações', 'danger' )
                setLoad( false )
                createLog( `Impossível verificar por atualizações -> ${ err }` )
                console.error( err )
            } )
    }

    function selfUpdate ( url ) {
        setUpdate( true )

        console.log( 'atualizando ', url )
    }

    async function buscarImpressoras () {
        let faixas = []
        if ( dados.state.dhcp ) faixas = await DHCP.pegarIpDhcp()
        if ( !dados.state.dhcp ) faixas = dados.state.ip

        for ( let faixa of faixas.split( ';' ) ) {
            for ( let x = 0; x < 255; x++ ) {

                // se o ip for em branco, ou menor que 0.0.0 (5 caractéres)
                if ( faixa.length < 5 ) continue

                const ip = `${ faixa }${ x }`
                SNMP.verificarIp( ip ).then( async ( impressora ) => {
                    await impressora.pegarDados()
                    const { contador, serial, modelo } = impressora

                    // se os dados da impressora forem inválidos não gravará
                    if ( !modelo || !serial || !contador ) return createLog( `Dados da impressora estão inválidos - IP ${ ip } - Impressora: ${ JSON.stringify( impressora ) }` )

                    Database.salvarImpressora( dados.state.id, { modelo, serial, ip, contador }, dados.state.proxy,
                        dados.state.user, dados.state.pass, dados.state.host, dados.state.port ).then( res => {
                            // primeiro de tudo finaliza a conexão snmp
                            impressora.snmp.close()
                            // atualiza o cadastro local
                            setCadastro( res.data.cadastro )
                            // adiciona o contador atual da impressora ao histórico
                            setHistorico( { ...tela.state.historico, [ serial ]: { ...tela.state.historico[ serial ], [ res.data.historico.chave ]: res.data.historico.valor } } )

                            console.log( 'impressora gravada, recebido - ', res.data )

                        } ).catch( err => {
                            // se o erro for 401 é por que a impressora não contabiliza
                            if ( err.response.status === 401 ) Notification.notificate( 'Alerta', 'Impressora não contabiliza e foi ignorada', 'warning' )
                            if ( err.response.status === 401 ) return createLog( `Impressora não contabiliza e foi ignorada - IP: ${ impressora.ip }` )
                            // em caso de outros erros ao salvar a impressora
                            Notification.notificate( 'Erro', `Erro ao salvar dados da impressora - IP: ${ impressora.ip }`, 'danger' )
                            createLog( `Erro ao salvar dados da impressora encontrada no IP: ${ impressora.ip } - Erro: ${ err }` )
                        } )
                }, () => { } )
            }
        }
    }

    return ( <TelaListagem { ...{ getDados } } /> )
}

export default Listagem