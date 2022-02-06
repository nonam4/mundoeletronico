import { useEffect } from 'react'
import packageInfo from '../../../package.json'

import { createLog } from '../../workers/storage'
import { useTela } from '../../contexts/TelaContext'
import { useDados } from '../../contexts/DadosContext'
import * as Database from '../../workers/database'
import * as Notification from '../../workers/notification'

function Listagem () {
    const currentWindow = window.require( '@electron/remote' ).getCurrentWindow()
    const tela = useTela()
    const dados = useDados()

    const data = Database.getDatas()[ 0 ].value

    useEffect( () => {
        // inicia o loop principal do sistema
        loop()

        handleWindowClose()
        if ( currentWindow.isVisible() ) return
        // cria o ícone na tray do sistema se a janela não estiver visível
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
            console.log( res.data )
            setHistorico( res.data.historico )
            setCadastro( res.data.cadastro )
            // se o cadastro for válido busque por atualizações do sistema
            checkUpdates()
        } ).catch( err => {
            // em caso de erro ao buscar atualizações
            Notification.notificate( 'Erro', 'Cadastro inválido ou inexistente', 'danger' )
            setLoad( false )
            createLog( `Cadastro inválido ou inexistente -> ${ err }` )
            console.error( err )
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

    function buscarImpressoras () {
        setLoad( false )
        console.log( 'buscando impressoras' )
    }

    return (
        <div>Listagem</div>
    )
}

export default Listagem