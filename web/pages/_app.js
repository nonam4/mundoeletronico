import { useEffect } from 'react'
import { ThemeProvider } from 'styled-components'
import { DadosProvider, useDados } from '../contexts/DadosContext'
import usePersistedState from '../hooks/usePersistedState'

import Load from '../components/Load'
// notificções
import ReactNotification from 'react-notifications-component'
// estilizações
import 'react-notifications-component/dist/theme.css'
import GlobalStyle from '../styles/global'
// temas
import claro from '../styles/temas/claro'

function App ( { Component, pageProps } ) {
    return (
        <DadosProvider>
            <View>
                <Component { ...pageProps } />
            </View>
        </DadosProvider>
    )
}

export default App

function View ( { children } ) {
    const [ theme, setTheme ] = usePersistedState( 'tema', claro )
    const { state, dispatch } = useDados() // variaveis do contexto

    useEffect( () => {
        // primeiro render define o tema do contexto como vazio
        dispatch( { type: 'setTema', payload: { title: '' } } )
    }, [] )

    useEffect( () => {
        if ( state.tema === undefined ) return
        // se o tema do contexto for vazio define o tema local
        if ( state.tema.title === '' ) return dispatch( { type: 'setTema', payload: theme } )
    }, [ theme ] )

    useEffect( () => {
        if ( state.tema === undefined ) return
        // se o tema do contexto não for vazio e for diferente do tema local, atualiza o tema local
        if ( state.tema.title !== '' && state.tema.title != theme.title ) setTheme( state.tema )
    }, [ state.tema ] )

    return (
        <ThemeProvider { ...{ theme } }>
            <GlobalStyle />
            <ReactNotification />
            <Load show={ state.load } />
            { children }
        </ThemeProvider>
    )
}
