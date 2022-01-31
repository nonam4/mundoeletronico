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
    const [ proxyUser, setProxyuser ] = useState( '' )
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
            Notification.notificate( 'Atenção', 'Local de instalação em branco ou muito curto!', 'warning' )
            return false
        }
        return true
    }

    function verificarDados () {
        console.log( 'verificando' )
    }

    return (
        <S.Container>
            <S.Logo src='/icon.ico' />

            <S.SubCointaners>

                <TextContainer>
                    <TextField onChange={ e => setUserid( e.target.value.toLowerCase() ) } value={ userid } placeholder={ 'ID do cadastro' } icon={ 'usuario' } maxLength={ 13 } />
                </TextContainer>
                <TextContainer>
                    <TextField onChange={ e => setLocal( e.target.value ) } value={ local } placeholder={ 'Local de instalação' } icon={ 'coletor_chave' } />
                </TextContainer>
                <Checkbox text={ 'Usar Proxy?' } changeReturn={ () => setProxyAtivo( !proxyAtivo ) } />

            </S.SubCointaners>

            <S.Divisor />

            <S.SubCointaners>

            </S.SubCointaners>

            <Button text={ 'Verificar' } onClick={ verificarDados } />
        </S.Container>
    )
}

function TextContainer ( props ) {
    const settings = {
        width: '250px',
        height: '50px',
    }
    return (
        <S.TextFileds width={ props.width || settings.width } height={ props.height || settings.height }>
            { props.children }
        </S.TextFileds>
    )
}

export default Configuracoes