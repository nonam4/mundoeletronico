import { useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { useDados } from '../../contexts/DadosContext'
import { useTela } from '../../contexts/TelaContext'
import usePersistedState from '../../hooks/usePersistedState'

import Load from '../Load'
// temas
import claro from '../../styles/temas/claro'
import escuro from '../../styles/temas/escuro'
import GlobalStyle from '../../styles/global'

function MainPage () {
    const dados = useDados() // variaveis do contexto
    const tela = useTela() // variaveis do contexto
    const [ dadosState, setDadosState ] = usePersistedState( dados.state )
    const [ theme, setTheme ] = useState( claro )

    function selectTheme ( title ) {
        console.log( title )
        switch ( title ) {
            case 'claro':
                return claro
            case 'escuro':
                return escuro
            default:
                return claro
        }
    }

    // monitora toda alteração no contexto de dados e salva em arquivo local no disco
    useEffect( () => {
        setDadosState( dados.state )
    }, [ dados.state ] )

    useEffect( () => {
        if ( dadosState.tema === undefined ) return
        // se o tema do contexto for vazio define o tema local
        dados.dispatch( { type: 'setTema', payload: theme.title } )
    }, [ theme ] )

    useEffect( () => {
        if ( dadosState.tema === undefined ) return
        // se o tema do contexto não for vazio e for diferente do tema local, atualiza o tema local
        if ( dadosState.tema != theme.title ) setTheme( selectTheme( dadosState.tema ) )
    }, [ dadosState.tema ] )

    return (
        <ThemeProvider { ...{ theme } }>
            <GlobalStyle />
            <Load show={ tela.state.load } />
        </ThemeProvider>
    )
}

export default MainPage