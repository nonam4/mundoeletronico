import { useRouter } from 'next/router'
import Head from 'next/head'
import { ThemeContext } from 'styled-components'
import { useEffect, useContext } from 'react'
import { useDados } from '../../contexts/DadosContext'
import usePersistedState from '../../hooks/usePersistedState'

import * as Database from '../../workers/database'

import SideMenu from '../SideMenu'

import CadastroCliente from '../Cadastros/CadastroCliente'
import CadastroImpressoras from '../Impressoras/CadastroImpressoras'
import CadastroAtendimento from '../Atendimentos/CadastroAtendimento'

export default function Index ( { children } ) {
    const { colors } = useContext( ThemeContext )
    const router = useRouter()
    const [ usuario, setUsuario ] = usePersistedState( 'usuario', undefined )
    const { state, dispatch } = useDados()

    const stack = {
        cadastrocliente: <CadastroCliente />,
        cadastroimpressoras: <CadastroImpressoras />,
        cadastroatendimento: <CadastroAtendimento />
    }

    useEffect( () => {
        // usuario local ainda não pegou os dados salvos
        // aguarda o proximo ciclo
        if ( usuario === undefined ) return

        // usuario local é inválido ou vazio, vá para login
        if ( !usuario ) return router.replace( '/login' )

        // o usuário local não é inválido nem vazio, define ele no state
        if ( usuario ) dispatch( { type: 'setUsuario', payload: usuario } )
    }, [ usuario ] )

    useEffect( () => {
        // se estiver no valor inicial (undefined) não faz nada
        if ( state.usuario === undefined ) return

        // usuario no state é valido, reautentica
        if ( state.usuario && !state.autenticado ) return router.replace( `/login?fallback=${ router.asPath.replace( '/', '' ).replace( /&/g, '_' ) }` )

        // usuario certo e autenticado
        if ( state.usuario && state.autenticado ) prepararApp()

        // state definido totalmente como null, logoff
        if ( !state.usuario && !state.autenticado ) return setUsuario( null )

    }, [ state.usuario, state.autenticado ] )


    function prepararApp () {
        /*
        Database.getAll().then( res => {

            setHistorico( res.data.historico )
            setCadastros( res.data.cadastros )
            setAtendimentos( res.data.atendimentos )

        } ).catch( err => {
            setLoad( false )
            Notification.notificate( 'Erro', 'Recarregue a página e tente novamente!', 'danger' )
            console.error( err )
        } )
        */
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