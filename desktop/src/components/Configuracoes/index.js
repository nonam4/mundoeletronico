import { ThemeContext } from 'styled-components'
import { useContext, useEffect, useState } from 'react'
import { useDados } from '../../contexts/DadosContext'
import { useTela } from '../../contexts/TelaContext'

import TextField from '../Inputs/TextField'
import Checkbox from '../Inputs/Checkbox'
import Button from '../Inputs/Button'

import * as Notification from '../../workers/notification'
import * as S from './styles'

function Configuracoes () {
    const dados = useDados()
    const tela = useTela()

    const [ userid, setUserid ] = useState( '' )
    const [ local, setLocal ] = useState( '' )
    const [ proxyAtivo, setProxyAtivo ] = useState( false )
    const [ proxyHost, setProxyHost ] = useState( '' )
    const [ proxyPort, setProxyPort ] = useState( '' )
    const [ proxyUser, setProxyUser ] = useState( '' )
    const [ proxyPass, setProxyPass ] = useState( '' )

    useEffect( () => {
        // quando essa tela iniciar esconderá o load
        setLoad( false )
    }, [] )

    function setLoad ( valor ) {
        tela.dispatch( { type: 'setLoad', payload: valor } )
    }

    function formularioValido () {
        if ( userid.length != 13 ) {
            Notification.notificate( 'Atenção', 'Usuário em branco ou inválido!', 'warning' )
            return false
        }
        if ( local.length < 3 ) {
            Notification.notificate( 'Atenção', 'Local de instalação vazio ou muito curto!', 'warning' )
            return false
        }
        return true
    }

    function verificarDados () {
        console.log( 'verificando' )
        formularioValido()
    }

    return (
        <S.Container>
            <S.Logo src='/icon.ico' />
            <S.SubCointaner>
                <S.DivisorContainerEsquerda>
                    <TextContainer width={ '310px' }>
                        <TextField onChange={ e => setUserid( e.target.value.toLowerCase() ) } value={ userid } placeholder={ 'ID do cadastro' } icon={ 'usuario_id' } maxLength={ 13 } />
                    </TextContainer>
                    <TextContainer width={ '310px' }>
                        <TextField onChange={ e => setLocal( e.target.value ) } value={ local } placeholder={ 'Local de instalação' } icon={ 'coletor_pc' } />
                    </TextContainer>
                </S.DivisorContainerEsquerda>
                <S.Divisor />
                <S.DivisorContainerDireita>
                    <Checkbox text={ 'Usar Proxy?' } paddingLeft={ '9px' } changeReturn={ () => setProxyAtivo( !proxyAtivo ) } />
                    { proxyAtivo && <>
                        <S.Linha>
                            <TextContainer width={ '183px' } marginRight={ '0.4rem' }>
                                <TextField onChange={ e => setProxyHost( e.target.value.toLowerCase() ) } value={ proxyHost } placeholder={ 'Enderço' } icon={ 'coletor_host' } maxLength={ 15 } />
                            </TextContainer>
                            <TextContainer width={ '114px' } marginLeft={ '0.4rem' }>
                                <TextField onChange={ e => setProxyPort( e.target.value ) } value={ proxyPort } placeholder={ 'Porta' } icon={ 'coletor_porta' } maxLength={ 4 } />
                            </TextContainer>
                        </S.Linha>
                        <TextContainer width={ '310px' }>
                            <TextField onChange={ e => setProxyUser( e.target.value.toLowerCase() ) } value={ proxyUser } placeholder={ 'Usuário do proxy' } icon={ 'usuario' } />
                        </TextContainer>
                        <TextContainer width={ '310px' }>
                            <TextField onChange={ e => setProxyPass( e.target.value ) } value={ proxyPass } placeholder={ 'Senha do proxy' } icon={ 'coletor_chave' } />
                        </TextContainer>
                    </> }
                </S.DivisorContainerDireita>
            </S.SubCointaner>
            <S.Button> <Button text={ 'Verificar' } onClick={ verificarDados } /> </S.Button>
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