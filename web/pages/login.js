import Head from 'next/head'
import { ThemeContext } from 'styled-components'
import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDados } from '../contexts/DadosContext'

import TextField from '../components/Inputs/TextField'
import Checkbox from '../components/Inputs/Checkbox'
import Button from '../components/Inputs/Button'

import usePersistedState from '../hooks/usePersistedState'

import * as Notification from '../workers/notification'
import * as Database from '../workers/database'
import * as S from '../styles/login'

function Login () {
    const { colors } = useContext( ThemeContext )
    const router = useRouter()
    const { state, dispatch } = useDados()
    const [ usuario, setUsuario ] = usePersistedState( 'usuario', undefined )

    const [ username, setUsername ] = useState( '' )
    const [ password, setPassword ] = useState( '' )
    const [ temporario, setTemporario ] = useState( true ) //username temporário ou definitivo?

    useEffect( () => {
        // state não foi definido, usuario ainda não pegou dados locais
        // aguarde proximo ciclo
        if ( state.usuario === undefined && usuario === undefined ) return

        // usuário não existe nos dados locais
        // libere o formulário de login
        if ( !usuario && !state.usuario ) return setLoad( false )

        // usuario local valido, define no state
        if ( usuario && !state.usuario && !state.autenticado ) dispatch( { type: 'setUsuario', payload: usuario } )

        // usuario no state válido, tentando reautenticar
        if ( state.usuario && !state.autenticado ) return reautenticar( state.usuario )

        // autenticado, volta para de onde veio
        if ( state.usuario && state.autenticado && router.query.fallback ) return router.replace( `/${ router.query.fallback.replace( /_/g, '&' ) }` )

        // autenticado, volta para a página padrão
        if ( state.usuario && state.autenticado ) return router.replace( '/impressoras' )

    }, [ state.usuario, usuario ] )

    function setLoad ( valor ) {
        if ( typeof valor !== 'boolean' ) throw new Error( 'Valor para "Load" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setLoad', payload: valor } )
    }

    function setAutenticado ( valor ) {
        if ( typeof valor !== 'boolean' ) throw new Error( 'Valor para "Load" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setAutenticado', payload: valor } )
    }

    function reautenticar ( usuario ) {
        let { username, password } = usuario
        setAutenticado( false )

        Database.autenticar( username, password ).then( res => {
            setAutenticado( true )
            setUsuario( { ...res.data, password, temporario: usuario.temporario } )
        } ).catch( err => {
            // em caso de erro, define que não está mais autenticado
            Notification.notificate( 'Erro', 'Usuário ou senha incorretos!', 'danger' )
            setLoad( false )
            console.error( err )
        } )
    }

    function handleLogin () {
        if ( !formularioValido() ) return

        setLoad( true )
        setAutenticado( false )

        Database.autenticar( username, password ).then( res => {
            setAutenticado( true )
            setUsuario( { ...res.data, password, temporario } )
        } ).catch( err => {
            // em caso de erro, define que não está mais autenticado
            Notification.notificate( 'Erro', 'Usuário ou senha incorretos!', 'danger' )
            setLoad( false )
            console.error( err )
        } )
    }

    function formularioValido () {
        if ( username.length < 3 ) {
            Notification.notificate( 'Atenção', 'Usuário em branco ou inválido!', 'warning' )
            return false
        }
        if ( password.length < 3 ) {
            Notification.notificate( 'Atenção', 'Senha em branco ou inválida!', 'warning' )
            return false
        }
        return true
    }

    return (
        <S.Container>
            <Head>
                <title>Mundo Eletrônico</title>
                <link rel='icon' href='/icon.png' />
                <meta name='theme-color' content={ colors.background }></meta>
            </Head>
            <S.Logo src='/icon.png' />
            <>
                <TextContainer>
                    <TextField onChange={ e => setUsername( e.target.value.toLowerCase() ) } value={ username } placeholder={ 'Usuário' } icon={ 'usuario' } />
                </TextContainer>
                <TextContainer>
                    <TextField onChange={ e => setPassword( e.target.value ) } value={ password } placeholder={ 'Senha' } icon={ 'coletor_chave' } type={ 'password' } />
                </TextContainer>
                <Checkbox text={ 'Ficar conectado' } changeReturn={ () => setTemporario( !temporario ) } />
                <Button text={ 'Entrar' } onClick={ handleLogin } />
            </>
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

export default Login