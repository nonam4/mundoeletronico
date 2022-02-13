import { ThemeContext } from 'styled-components'
import { useContext, useEffect, useState } from 'react'
import { useDados } from '../../contexts/DadosContext'
import { useTela } from '../../contexts/TelaContext'

import TextField from '../Inputs/TextField'
import Checkbox from '../Inputs/Checkbox'
import Button from '../Inputs/Button'

import * as Notification from '../../workers/notification'
import * as DHCP from '../../workers/dhcp'
import Storage from '../../workers/storage'
import * as S from './styles'

function Configuracoes () {
    const currentWindow = window.require( '@electron/remote' ).getCurrentWindow()
    const storage = new Storage()
    const { colors } = useContext( ThemeContext )
    const dados = useDados()
    const tela = useTela()
    const [ ipDhcp, setIpDhcp ] = useState( undefined )
    const [ userId, setUserId ] = useState( dados.state.id )
    const [ local, setLocal ] = useState( dados.state.local )
    const [ proxyAtivo, setProxyAtivo ] = useState( dados.state.proxy )
    const [ proxyHost, setProxyHost ] = useState( dados.state.host )
    const [ proxyPort, setProxyPort ] = useState( dados.state.port )
    const [ proxyUser, setProxyUser ] = useState( dados.state.user )
    const [ proxyPass, setProxyPass ] = useState( dados.state.pass )
    const [ dhcpAtivo, setDhcpAtivo ] = useState( dados.state.dhcp )
    const [ faixasIp, setFaixasIp ] = useState( dados.state.ip )
    const [ primeiraTelaPreenchida, setPrimeiraTelaPreenchida ] = useState( false ) // se a primeira tela de dados está preenchida
    const [ segundaTelaPreenchida, setSegundaTelaPreenchida ] = useState( false ) // se a segunda tela de dados está preenchida

    useEffect( () => {
        async function pegarIpDhcp () {
            setIpDhcp( await DHCP.pegarIpDhcp() )
        }

        pegarIpDhcp()
        createWindow()
        handleWindowClose()
    }, [] )

    useEffect( () => {
        if ( !ipDhcp ) return // se ainda não tiver pego o IP via DHCP então não faça nada

        // define o host do proxy
        setProxyHost( `${ ipDhcp }254` )
        // define as faixas de IP com o ip do dhcp
        setFaixasIp( `${ ipDhcp };` )

        // por fim esconde o load
        setLoad( false )
    }, [ ipDhcp ] )

    function createWindow () {
        // determina se irá criar uma janela pedindo os dados de configuração
        if ( dados.state.id && dados.state.id !== '' ) return
        if ( currentWindow.isVisible() ) return
        // se for preciso abra a janela atual que está somente escondida
        currentWindow.show()
    }

    function handleWindowClose () {
        // cuida para que não feche a janela enquanto não preencher os dados
        currentWindow.on( 'close', () => { } )
    }

    function setLoad ( valor ) {
        tela.dispatch( { type: 'setLoad', payload: valor } )
    }

    function formularioValido () {
        if ( userId.length !== 13 ) {
            Notification.notificate( 'Atenção', 'Usuário em branco ou inválido!', 'warning' )
            return false
        }
        if ( local.length < 3 ) {
            Notification.notificate( 'Atenção', 'Local de instalação vazio ou muito curto!', 'warning' )
            return false
        }
        if ( !primeiraTelaPreenchida ) {
            setPrimeiraTelaPreenchida( true )
            return false
        }
        if ( proxyAtivo ) {
            if ( !ipHostValido( proxyHost ) ) {
                Notification.notificate( 'Atenção', 'O IP Host do proxy é inválido!', 'warning' )
                return false
            }
            if ( proxyPort === '' ) {
                Notification.notificate( 'Atenção', 'A Porta do proxy é inválida!', 'warning' )
                return false
            }
            if ( proxyUser.length < 3 ) {
                Notification.notificate( 'Atenção', 'Usuário do proxy em branco ou inválido!', 'warning' )
                return false
            }
            if ( proxyPass.length < 3 ) {
                Notification.notificate( 'Atenção', 'Senha do proxy em branco ou inválida!', 'warning' )
                return false
            }
        }
        if ( !segundaTelaPreenchida ) {
            setSegundaTelaPreenchida( true )
            return false
        }
        if ( dhcpAtivo ) {
            if ( !listaIpsValida( faixasIp ) ) {
                Notification.notificate( 'Atenção', 'Algum IP da lista é inválido!', 'warning' )
                return false
            }
        }
        return true
    }

    function verificarDados () {

        let settings = {
            id: userId, local,
            proxy: proxyAtivo,
            user: proxyUser,
            pass: proxyPass,
            host: proxyHost,
            port: proxyPort,
            dhcp: dhcpAtivo,
            ip: faixasIp,
            tema: dados.state.tema
        }

        setLoad( true )
        if ( !formularioValido() ) return setLoad( false )

        storage.set( settings, () => {
            dados.dispatch( {
                type: 'setAll', payload: settings
            } )
        } )

        setTimeout( () => {
            tela.dispatch( { type: 'setConfigs', payload: false } )
        }, 300 )
    }

    function handleIdChange ( value ) {
        if ( !isNaN( value ) ) setUserId( value )
    }

    function handleProxyHostChange ( e ) {
        const teclasPermitidos = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', null ]
        let teclaApertada = e.nativeEvent.data
        let value = e.target.value
        let contadorDeNumeros = 0 // mínimo de 5 e máximo de 12 números
        let contadorDePontos = 0 //todo IP tem no máximo 3 pontos

        for ( let val of value ) {
            if ( val === '.' ) contadorDePontos++
            if ( !isNaN( val ) ) contadorDeNumeros++
        }

        if ( teclasPermitidos.indexOf( teclaApertada ) < 0 ) return // se a tecla não for válida não faça nada
        if ( contadorDeNumeros > 12 && teclaApertada !== null ) return // se já tiver 12 números e não estiver apagando não faça nada
        if ( contadorDePontos > 3 ) return // se já tiver 3 pontos não faça nada

        setProxyHost( value )
    }

    function handlePortaProxyChange ( value ) {
        if ( !isNaN( value ) ) setProxyPort( value )
    }

    function handleFaixasIpChange ( e ) {
        const teclasPermitidos = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', ';', null ]
        let teclaApertada = e.nativeEvent.data
        let value = e.target.value
        let contadorDeNumeros = 0 // mínimo de 5 e máximo de 9 números
        let contadorDePontos = 0 //todo IP tem 3 pontos

        for ( let val of value ) {
            if ( val === ';' ) {
                contadorDeNumeros = 0
                contadorDePontos = 0
            }
            if ( val === '.' ) contadorDePontos++
            if ( !isNaN( val ) ) contadorDeNumeros++
        }

        if ( teclasPermitidos.indexOf( teclaApertada ) < 0 ) return // se a tecla não for válida não faça nada
        if ( contadorDeNumeros > 9 && ( teclaApertada !== null || teclaApertada !== ';' ) ) return // se já tiver 9 números e não estiver apagando não faça nada
        if ( contadorDePontos > 3 ) return // se já tiver 3 pontos não faça nada

        setFaixasIp( value )
    }

    function ipHostValido ( value ) {
        let ipDividido = value.split( '.' )
        let invalido = false

        if ( ipDividido.length !== 4 ) return false

        for ( let sessao of ipDividido ) {
            if ( sessao.length > 3 || sessao.length < 1 ) invalido = true
        }

        if ( invalido ) return false
        return true
    }

    function listaIpsValida ( value ) {
        let ipsDivididos = value.split( ';' )
        let invalido = false

        for ( let ip of ipsDivididos ) {
            let ipDividido = ip.split( '.' )

            if ( ip === '' && ipsDivididos.indexOf( ip ) === ipsDivididos.length - 1 ) continue // evita caso o usuário coloque um ponto e virgula no final e não digite outros ips depois
            if ( ipDividido.length !== 4 ) invalido = true

            for ( let sessao of ipDividido ) {
                if ( sessao === '' && ipDividido.indexOf( sessao ) === 3 ) continue // como os ips terminarão com ponto, evita comparar depois do ultimo ponto que é vazio
                if ( sessao.length > 3 || sessao.length < 1 ) invalido = true
            }
        }

        if ( invalido ) return false
        return true
    }

    function voltarTelaAnterior () {
        if ( segundaTelaPreenchida ) return setSegundaTelaPreenchida( false )
        if ( primeiraTelaPreenchida ) return setPrimeiraTelaPreenchida( false )
    }

    return (
        <S.Container>
            <S.Logo src='./icon.png' />
            <S.Suporte>Em caso de dúvidas, fale com o suporte</S.Suporte>
            <S.Suporte>WhatsApp: <b>(47) 99964-9667</b></S.Suporte>
            <S.SubCointaner>
                { !primeiraTelaPreenchida && <S.Divisor>
                    <TextContainer width={ '310px' }>
                        <TextField onChange={ e => handleIdChange( e.target.value ) } value={ userId } placeholder={ 'ID do cadastro' } icon={ 'usuario_id' } maxLength={ 13 } />
                    </TextContainer>
                    <TextContainer width={ '310px' }>
                        <TextField onChange={ e => setLocal( e.target.value ) } value={ local } placeholder={ 'Local de instalação' } icon={ 'coletor_pc' } />
                    </TextContainer>
                </S.Divisor> }

                { primeiraTelaPreenchida && !segundaTelaPreenchida && <S.Divisor>
                    <Checkbox text={ 'Usar Proxy?' } paddingLeft={ '9px' } checked={ proxyAtivo } changeReturn={ () => setProxyAtivo( !proxyAtivo ) } />
                    { proxyAtivo && <>
                        <S.Linha>
                            <TextContainer width={ '183px' } marginRight={ '0.4rem' }>
                                <TextField onChange={ e => handleProxyHostChange( e ) } value={ proxyHost } placeholder={ 'Enderço' } icon={ 'coletor_host' } maxLength={ 15 } />
                            </TextContainer>
                            <TextContainer width={ '114px' } marginLeft={ '0.4rem' }>
                                <TextField onChange={ e => handlePortaProxyChange( e.target.value ) } value={ proxyPort } placeholder={ 'Porta' } icon={ 'coletor_porta' } maxLength={ 4 } />
                            </TextContainer>
                        </S.Linha>
                        <TextContainer width={ '310px' }>
                            <TextField onChange={ e => setProxyUser( e.target.value.toLowerCase() ) } value={ proxyUser } placeholder={ 'Usuário do proxy' } icon={ 'usuario' } />
                        </TextContainer>
                        <TextContainer width={ '310px' }>
                            <TextField onChange={ e => setProxyPass( e.target.value ) } value={ proxyPass } placeholder={ 'Senha do proxy' } icon={ 'coletor_chave' } type={ 'password' } />
                        </TextContainer>
                    </> }
                </S.Divisor> }
                { segundaTelaPreenchida && <S.Divisor>
                    <Checkbox width={ '310px' } text={ 'Definir faixas de IPs manualmente?' } paddingLeft={ '9px' } checked={ !dhcpAtivo } changeReturn={ () => setDhcpAtivo( !dhcpAtivo ) } />

                    <TextContainer width={ '310px' } marginRight={ '0.4rem' }>
                        <TextField disabled={ dhcpAtivo } onChange={ e => handleFaixasIpChange( e ) } value={ faixasIp } placeholder={ 'Faixas IP' } icon={ 'coletor_dhcp' } maxLength={ 45 } />
                    </TextContainer>
                    { !dhcpAtivo && <>
                        <S.Info>Não coloque o IP das impressoras mas sim as faixas de IP</S.Info>
                        <S.Info>Coloe um ponto ao fim de cada faixa</S.Info>
                        <S.Info>Separe cada faixa de IP com um ponto e vírgula ( ; )</S.Info>
                        <S.Info>Ex: <b>192.168.2. ; 10.0.0. ; 192.168.100.</b></S.Info>
                    </> }
                </S.Divisor> }
            </S.SubCointaner>
            <S.Button>
                { primeiraTelaPreenchida && <Button background={ colors.vermelho } text={ 'Voltar' } onClick={ voltarTelaAnterior } /> }
                <Button text={ segundaTelaPreenchida ? 'Verificar' : 'Avançar' } onClick={ verificarDados } />
            </S.Button>
        </S.Container>
    )
}

function TextContainer ( props ) {
    const settings = {
        width: '250px',
        height: '50px',
        marginRight: '1rem',
        marginLeft: '1rem',
    }
    return (
        <S.TextFileds width={ props.width || settings.width } height={ props.height || settings.height }
            marginRight={ props.marginRight || settings.marginRight } marginLeft={ props.marginLeft || settings.marginLeft }>
            { props.children }
        </S.TextFileds>
    )
}

export default Configuracoes