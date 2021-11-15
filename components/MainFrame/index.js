import { useRouter } from 'next/router'
import Head from 'next/head'
import { ThemeContext } from 'styled-components'
import { useEffect, useContext } from 'react'
import { useDados } from '../../contexts/DadosContext'
import usePersistedState from '../../hooks/usePersistedState'

import SideMenu from '../SideMenu'

import CadastroCliente from '../Clientes/CadastroCliente'
import CadastroImpressoras from '../Impressoras/CadastroImpressoras'

export default function Index ( { children } ) {
    const { colors } = useContext( ThemeContext )
    const router = useRouter()
    const [ usuario, setUsuario ] = usePersistedState( 'usuario', undefined )
    const { state, dispatch } = useDados()

    const stack = {
        cadastrocliente: <CadastroCliente />,
        cadastroimpressoras: <CadastroImpressoras />
    }

    useEffect( () => {
        // inicialmente o usuário será undefined então espera o proximo ciclo
        if ( usuario === undefined ) return

        // se não tiver nenhum dado do usuário salvo localmente ou o valor for null vá para login
        if ( !usuario ) return router.replace( '/login' )

        // se não estiver autenticado mas tem usuário salvo tente login automático
        if ( usuario && !state.autenticado ) return router.replace( `/login?fallback=${ router.pathname.replace( '/', '' ) }` )

        // se estiver autenticado e salvo, prepare o app
        if ( usuario && state.autenticado ) return prepararApp()
    }, [ usuario ] )

    useEffect( () => {
        // se estiver no valor inicial (undefined) não faz nada
        if ( state.usuario === undefined ) return

        // se o state for definido como null limpa os dados locais e o useEffect do usuário se encarrega de redirecionar para o login
        if ( !state.usuario && !state.autenticado ) return setUsuario( null )
    }, [ state.autenticado ] )

    function toggleLoad () {
        dispatch( { type: 'setLoad', payload: !state.load } )
    }

    function prepararApp () {
        // primeiro tenta atualizar o usuário nas variáveis de ambiente
        // sempre que precisar buscaremos o login aqui ao invés do localstorage
        dispatch( { type: 'setUsuario', payload: usuario } )
        toggleLoad()
    }

    return (
        <>
            <Head>
                <title>Mundo Eletrônico</title>
                <link rel='icon' href='/icon.png' />
                <meta name='theme-color' content={ colors.background }></meta>
            </Head>
            { state.usuario && state.autenticado && <>
                { children }
                { router.query.stack && stack[ router.query.stack ] }
                { router.query.stack1 && stack[ router.query.stack1 ] }
                <SideMenu />
            </> }
        </>
    )
}