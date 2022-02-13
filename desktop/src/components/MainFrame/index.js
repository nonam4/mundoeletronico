import { useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { useDados } from '../../contexts/DadosContext'
import { useTela } from '../../contexts/TelaContext'

import Load from '../Load'
import Atualizando from '../Atualizando'
import SemInternet from '../SemInternet'
import Configuracoes from '../Configuracoes'
import Listagem from '../Listagem'

// temas
import claro from '../../styles/temas/claro'
import escuro from '../../styles/temas/escuro'
import GlobalStyle from '../../styles/global'

import Storage from '../../workers/storage'

function MainPage () {
    const dados = useDados() // variaveis do contexto
    const tela = useTela() // variaveis do contexto
    const [ theme, setTheme ] = useState( claro )
    const [ storageInciado, setStorageIniciado ] = useState( false )
    const [ onLine, setOnLine ] = useState( navigator.onLine )
    const storage = new Storage()

    //adiciona os eventos para detectar se estamos online ou não
    window.addEventListener( 'online', atualizarOnline )
    window.addEventListener( 'offline', atualizarOnline )

    useEffect( () => {
        storage.init( () => {
            dados.dispatch( {
                type: 'setAll', payload: {
                    id: storage.get( 'id' ),
                    local: storage.get( 'local' ),
                    proxy: storage.get( 'proxy' ),
                    user: storage.get( 'user' ),
                    pass: storage.get( 'pass' ),
                    host: storage.get( 'host' ),
                    port: Number( storage.get( 'port' ) ),
                    dhcp: storage.get( 'dhcp' ),
                    ip: storage.get( 'ip' ),
                    tema: storage.get( 'tema' )
                }
            } )

            setStorageIniciado( true )
        } )
    }, [] )

    useEffect( () => {
        if ( dados.state.tema === undefined ) return
        // se o tema do contexto for vazio define o tema local
        dados.dispatch( { type: 'setTema', payload: theme.title } )
    }, [ theme ] )

    useEffect( () => {
        if ( dados.state.tema === undefined ) return
        // se o tema do contexto não for vazio e for diferente do tema local, atualiza o tema local
        if ( dados.state.tema !== theme.title ) setTheme( selectTheme( dados.state.tema ) )
    }, [ dados.state.tema ] )

    useEffect( () => {
        if ( !storageInciado ) return
        storage.set( dados.state, () => { } )
    }, [ dados.state ] )

    useEffect( () => {
        if ( !onLine ) setLoad( true )
    }, [ onLine ] )

    function setLoad ( valor ) {
        tela.dispatch( { type: 'setLoad', payload: valor } )
    }

    function selectTheme ( title ) {
        switch ( title ) {
            case 'escuro':
                return escuro
            default:
                return claro
        }
    }

    function atualizarOnline () {
        setOnLine( navigator.onLine )
    }

    return (
        <ThemeProvider { ...{ theme } }>
            <GlobalStyle />
            { onLine && storageInciado && <>
                { ( ( !dados.state.id || dados.state.id === '' ) || tela.state.configs ) && <Configuracoes /> }
                { onLine && dados.state.id && dados.state.id !== '' && !tela.state.configs && <Listagem /> }
            </> }
            <Load show={ tela.state.load } />
            <Atualizando show={ tela.state.atualizando } />
            <SemInternet show={ !onLine } />
        </ThemeProvider>
    )
}

export default MainPage