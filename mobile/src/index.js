
import React, { useState, useEffect } from 'react'
import { ThemeProvider } from 'styled-components'
import { useColorScheme, StatusBar } from 'react-native'
import { DadosProvider, useDados } from './contexts/DadosContext'
import DropdownNotification from 'react-native-dropdownalert'

import MainFrame from './components/MainFrame'
import Login from './components/Login'
import Load from './components/Load'

import * as Database from './workers/database'
import * as Storage from './workers/storage'
import Notification from './workers/notification'

import claro from './styles/temas/claro'
import escuro from './styles/temas/escuro'

function App () {
    return (
        <DadosProvider>
            <View />
        </DadosProvider>
    )
}

function View () {
    const { state, dispatch } = useDados()
    const isDarkTheme = useColorScheme() === 'dark'
    const theme = isDarkTheme ? escuro : claro
    const [ usuario, setUsuario ] = useState( undefined )

    function setLoad ( valor ) {
        if ( typeof valor !== 'boolean' ) throw new Error( 'Valor para "Load" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setLoad', payload: valor } )
    }

    function setAutenticado ( valor ) {
        if ( typeof valor !== 'boolean' ) throw new Error( 'Valor para "Load" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setAutenticado', payload: valor } )
    }

    function reautenticar () {
        let { username, password } = usuario
        setAutenticado( false )

        Database.autenticar( username, password ).then( res => {
            setAutenticado( true )
            setUsuario( { ...res.data, password } )
        } ).catch( err => {
            // se o usuário estiver incorreto invalida os dados locais
            // e solicita o login novamente
            Storage.storeData( {}, 'user' )
            Notification.notificate( 'error', 'Erro', 'Usuário ou senha incorretos!' )
            setLoad( false )
            console.error( err )
        } )
    }

    useEffect( () => {
        // tenta pegar os dados do usuário no armazenamento interno
        Storage.getData( 'user' ).then( value => {
            setUsuario( value )
        } )
    }, [] )

    useEffect( () => {

        // state não foi definido, usuario ainda não pegou dados locais
        // aguarde proximo ciclo
        if ( state.usuario === undefined && usuario === undefined ) return

        // se não estiver logado nem salvo libera o formulário de login
        // se estiver logado e salvo esconde o load e mostra a tela principal
        if ( !usuario && !state.usuario || state.usuario && state.autenticado ) return setLoad( false )

        // usuario local valido, define no state
        if ( usuario && !state.usuario && !state.autenticado ) dispatch( { type: 'setUsuario', payload: usuario } )

        // usuario no state válido, tentando reautenticar
        if ( state.usuario && !state.autenticado ) return reautenticar( state.usuario )

    }, [ state.usuario, usuario ] )


    return (
        <ThemeProvider { ...{ theme } }>
            <StatusBar
                barStyle={ isDarkTheme ? 'light-content' : 'dark-content' }
                backgroundColor={ theme.colors.background }
            />

            <DropdownNotification ref={ ref => { if ( ref ) Notification.setDropDown( ref ) } } />

            <Load show={ state.load } />
            { state.autenticado && <MainFrame /> }
            { !state.autenticado && <Login /> }
        </ThemeProvider>
    )
}

export default App
