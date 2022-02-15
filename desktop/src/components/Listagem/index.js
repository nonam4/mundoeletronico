import { useEffect } from 'react'
import { createLog } from '../../workers/storage'
import { useTela } from '../../contexts/TelaContext'
import { useDados } from '../../contexts/DadosContext'

import * as Database from '../../workers/database'
import * as Notification from '../../workers/notification'
import * as SNMP from '../../workers/snmp'
import * as DHCP from '../../workers/dhcp'
import { getRootPath } from '../../workers/storage'

import TelaListagem from './TelaListagem'

const { app, shell } = window.require( '@electron/remote' )

function Listagem () {
    const currentWindow = window.require( '@electron/remote' ).getCurrentWindow()
    const tela = useTela()
    const dados = useDados()

    useEffect( () => {
        // inicia o loop principal do sistema
        handleWindowClose()
        criarTray()
        loop()
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

    function setAtualizando ( valor ) {
        setLoad( false )
        tela.dispatch( { type: 'setAtualizando', payload: valor } )
    }

    function setCadastro ( dados ) {
        tela.dispatch( { type: 'setCadastro', payload: dados } )
    }

    // loop principal do sistema, a cada hora irá realizar a mesma ação novamente
    function loop () {
        checkUpdates()
        setTimeout( () => {
            loop()
        }, 3600000 )
    }

    function checkUpdates () {
        Database.checkUpdates( process.platform, dados.state.local, dados.state.id, dados.state.proxy,
            dados.state.user, dados.state.pass, dados.state.host, dados.state.port ).then( res => {
                // se a url de update estiver presente irá atualizar
                if ( res.data.updateUrl ) return selfUpdate( res.data.updateUrl )
                // se não precisar atualizar
                getDados( Database.getDatas()[ 0 ].value )
            } ).catch( err => {
                // em caso de erro ao buscar atualizações
                Notification.notificate( 'Erro', 'Impossível verificar por atualizações', 'danger' )
                setLoad( false )
                createLog( `Impossível verificar por atualizações -> ${ err }` )
                console.error( err )
            } )
    }

    function getDados ( data, apenasDados ) {
        setLoad( true )
        // não precisa verificar qual o código de erro
        // se o cadastro não existir ou não estiver ativo irá retornar erro 40x
        // esse erro já vai direto para o catch
        Database.getDados( dados.state.id, data, dados.state.proxy,
            dados.state.user, dados.state.pass, dados.state.host, dados.state.port ).then( res => {
                setCadastro( res.data.cadastro )
                // se o cadastro for válido busque por impressoras
                if ( apenasDados !== false ) buscarImpressoras()
                setLoad( false )
            } ).catch( err => {
                // se o erro for 404 é porque o cadastro não foi encontrado ou foi excluido
                // nesse caso iremos remover a ID dos arquivos locais
                if ( err.response.status === 404 ) {
                    Notification.notificate( 'Erro', 'Cadastro inativo!', 'danger' )
                    createLog( `Cadastro inexistente -> ${ err }` )
                    dados.dispatch( { type: 'setId', payload: '' } )
                }
                // se o erro for 401 é por que o cadastro está inativo
                if ( err.response.status === 401 ) {
                    Notification.notificate( 'Erro', 'Cadastro inativo!', 'danger' )
                    createLog( `Cadastro inativo -> ${ err }` )
                }
                // se não for nenhum dos erros acima então é algum problema de conexão
                if ( err.response.status !== 404 && err.response.status !== 401 ) {
                    Notification.notificate( 'Erro', 'A conexão ao banco de dados falhou!', 'danger' )
                    createLog( `Erro de conexão ao banco de dados -> ${ err }` )
                }
                setLoad( false )
            } )
    }

    function selfUpdate ( url ) {
        setAtualizando( true )

        window.require( '@electron/remote' ).require( 'electron-download-manager' ).download( { url }, err => {
            if ( err ) {
                createLog( `Erro ao fazer o download de atualizações - Erro: ${ err }` )
                // se der erro ao baixar a atualização irá ignorar e buscar impressoras
                setAtualizando( false )
                return buscarImpressoras()
            }
            if ( !err ) shell.openExternal( `${ getRootPath( 'updater.bat' ) }` )
            app.exit()
        } )
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

                    setLoad( true )
                    Database.salvarImpressora( dados.state.id, { modelo, serial, ip, contador, data: tela.state.data ? tela.state.data : Database.getDatas()[ 0 ].value },
                        dados.state.proxy, dados.state.user, dados.state.pass, dados.state.host, dados.state.port ).then( res => {
                            // primeiro de tudo finaliza a conexão snmp
                            impressora.snmp.close()
                            // atualiza o cadastro local
                            setCadastro( res.data.cadastro )
                            setLoad( false )
                        } ).catch( err => {
                            console.log( 'erro -> ', err, ' - response -> ', err.response )
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

    return ( <TelaListagem { ...{ getDados, checkUpdates } } /> )
}

export default Listagem