import { useEffect, useState } from 'react'
import packageInfo from '../../../package.json'

import { createLog } from '../../workers/storage'
import { useTela } from '../../contexts/TelaContext'
import { useDados } from '../../contexts/DadosContext'
import * as Database from '../../workers/database'
import * as Notification from '../../workers/notification'
import * as SNMP from '../../workers/snmp'

function Listagem () {
    const currentWindow = window.require( '@electron/remote' ).getCurrentWindow()
    const tela = useTela()
    const dados = useDados()

    const data = Database.getDatas()[ 0 ].value

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

        getDados()
        setTimeout( () => {
            loop()
        }, 3600000 )
    }

    function getDados () {
        // não precisa verificar qual o código de erro
        // se o cadastro não existir ou não estiver ativo irá retornar erro 40x
        // esse erro já vai direto para o catch
        Database.getDados( dados.state.id, data, dados.state.proxy ).then( res => {
            setHistorico( res.data.historico )
            setCadastro( res.data.cadastro )
            // se o cadastro for válido busque por atualizações do sistema
            checkUpdates()
        } ).catch( err => {
            // em caso de erro ao buscar atualizações
            Notification.notificate( 'Erro', 'Cadastro inválido ou inexistente', 'danger' )
            createLog( `Cadastro inválido ou inexistente -> ${ err }` )
            console.error( err )
            // se o erro for 404 é porque o cadastro não foi encontrado ou foi excluido
            // nesse caso iremos remover a ID dos arquivos locais
            if ( err.response.status === 404 ) return dados.dispatch( { type: 'setId', payload: '' } )
            setLoad( false )
        } )
    }

    function checkUpdates () {
        Database.checkUpdates( process.platform, packageInfo.version, dados.state.proxy ).then( res => {
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
        console.log( 'buscando impressoras' )
        let ips = []
        if ( dados.state.dhcp.active ) ips = await DHCP.pegatIpDhcp().split( ';' )
        if ( !dados.state.dhcp.active ) ips = dados.state.dhcp.ips.split( ';' )

        for ( let ip of ips ) {
            for ( let x = 0; x < 255; x++ ) {
                SNMP.verificarIp( `${ ip }.${ x }` ).then( ( impressora ) => {
                    console.log( impressora )

                    impressora.pegarDados().then( () => {
                        if ( !impressora.modelo || !impressora.serial || !impressora.leitura ) return createLog( `Dados da impressora estão inválidos - IP ${ ip } - Impressora: ${ JSON.stringify( impressora ) }` )
                        gravarImpressora( dados.state.id, impressora, dados.state.proxy ).then( res => {
                            console.log( res, ' - impressora gravada com sucesso' )
                        } ).catch( err => {
                            // em caso de erro ao buscar atualizações
                            Notification.notificate( 'Erro', `Erro ao salvar dados da impressora - IP: ${ impressora.ip }`, 'danger' )
                            createLog( `Erro ao salvar dados da impressora - IP: ${ impressora.ip } - Erro: ${ err }` )
                        } )
                    } )
                } )
            }
        }
    }

    return (
        <div>Listagem</div>
    )
}

export default Listagem