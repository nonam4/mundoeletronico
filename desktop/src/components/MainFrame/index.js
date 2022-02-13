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
    const storage = new Storage()

    function selectTheme ( title ) {
        switch ( title ) {
            case 'escuro':
                return escuro
            default:
                return claro
        }
    }

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

    return (
        <ThemeProvider { ...{ theme } }>
            <GlobalStyle />
            { navigator.onLine && <>
                { storageInciado && <>
                    { ( ( !dados.state.id || dados.state.id === '' ) || tela.state.configs ) && <Configuracoes /> }
                    { dados.state.id && dados.state.id !== '' && !tela.state.configs && <Listagem /> }
                </> }
                <Load show={ tela.state.load && !tela.state.atualizando } />
                <Atualizando show={ tela.state.atualizando } />
            </> }
            { !navigator.onLine && <SemInternet show={ !navigator.onLine } /> }
        </ThemeProvider>
    )
}

export default MainPage