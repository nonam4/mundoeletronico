import router from 'next/router'
import Head from 'next/head'
import { ThemeContext } from 'styled-components'
import { useEffect, useContext } from 'react'
import { useDados, ContextActions } from '../../contexts/DadosContext'

import usePersistedState from '../../hooks/usePersistedState'

import * as Database from '../../workers/database'

import SideMenu from '../SideMenu'
import Load from '../Load'

export default function Index ( { children } ) {
    const { colors } = useContext( ThemeContext )
    const [ usuario, setUsuario ] = usePersistedState( 'usuario', undefined )
    const { state, dispatch } = useDados()

    useEffect( () => {
        // inicialmente o usuário será undefined então espera o proximo ciclo
        if ( usuario === undefined ) return

        // se não tiver nenhum dado do usuário salvo localmente vá para login
        if ( !usuario ) return router.replace( '/login' )

        // se não estiver autenticado mas tem usuário salvo tente login automático
        if ( usuario && !state.autenticado ) return router.replace( '/login?fallback=impressoras' )

        // se estiver autenticado e salvo, prepare o app
        if ( usuario && state.autenticado ) return prepararApp()
    }, [ usuario ] )

    function toggleLoad () {
        dispatch( { type: ContextActions.setLoad, payload: !state.load } )
    }

    function prepararApp () {
        // primeiro tenta atualizar o usuário nas variáveis de ambiente
        // sempre que precisar buscaremos o login aqui ao invés do localstorage
        dispatch( { type: ContextActions.setUsuario, payload: usuario } )

        toggleLoad()
    }

    return (
        <>
            <Head>
                <title>Mundo Eletrônico</title>
                <link rel="icon" href="/icon.png" />
                <meta name='theme-color' content={ colors.background }></meta>
            </Head>
            { state.usuario && state.autenticado && <>
                { children }
                <SideMenu />
            </> }
            <Load show={ state.load } />
        </>
    )
}