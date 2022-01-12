import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import packageInfo from '../../package.json'
import { useDados } from '../../contexts/DadosContext'

import MenuIcon from '../Icons/MenuIcon'
import * as S from './styles'

function SideMenu () {
    const { state, dispatch } = useDados()
    const router = useRouter()
    let { expandido, sempreVisivel } = state.menu

    // todas as páginas que são stack tem que ter a opção stack como true
    const pages = {
        impressoras: {
            stack: false,
            url: 'impressoras'
        },
        atendimentos: {
            stack: false,
            url: 'atendimentos'
        },
        cadastrocliente: {
            stack: true,
            url: 'cadastrocliente'
        },
        cadastroatendimento: {
            stack: true,
            url: 'cadastroatendimento'
        }
    }

    // monitora redimensionamentos da tela
    useEffect( () => {
        function handleResize () {
            if ( window.innerWidth > 833 ) {
                setMenu( true, true )
            }
            if ( window.innerWidth < 834 ) {
                setMenu( false, false )
            }
        }

        // define se o menu está expandido ao iniciar o aplicativo
        handleResize()
        window.addEventListener( 'resize', handleResize )
        return () => window.removeEventListener( 'resize', handleResize )
    }, [] )

    function toggleLoad () {
        dispatch( { type: 'setLoad', payload: !state.load } )
    }

    function setMenu ( a, b ) {
        if ( typeof a !== 'boolean' || typeof b !== 'boolean' ) throw new Error( 'Valor para "Menu" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setMenu', payload: { expandido: a, sempreVisivel: b } } )
    }

    function trocarListagem ( listagem ) {

        let paginaAtual = router.pathname.replace( '/', '' )
        toggleLoad()
        // se a nova página desejada for empilhavel, mantém a mesma url e define uma query com a página em stack
        // se a página nova não for empilhavel muda a url para ela
        if ( listagem.stack ) {

            setTimeout( () => {
                router.push( {
                    pathname: paginaAtual,
                    query: {
                        stack: listagem.url
                    }
                } )
            }, [ 200 ] )
        } else {
            setTimeout( () => {
                router.push( listagem.url )
            }, [ 200 ] )
        }
    }

    function active ( item ) {
        if ( item === 'impressoras' && router.query.stack === 'cadastroimpressoras' ) return true
        if ( router.query.stack ) return item == router.query.stack
        return item == router.pathname.replace( '/', '' )
    }

    return (
        <S.Container expandido={ expandido } sempreVisivel={ sempreVisivel }>
            { !sempreVisivel &&
                <S.Expansor expandido={ expandido } onClick={ () => setMenu( !expandido, sempreVisivel ) } >
                    <MenuIcon size={ '18' } margin={ '0' } title={ 'Expandir/Recolher' } name={ expandido ? 'arrow_lft' : 'arrow_rgt' } />
                </S.Expansor>
            }

            <S.Actions>
                <S.MenuSection>
                    <S.MenuTitle>GERAL</S.MenuTitle>
                    <S.MenuItem> <MenuIcon name={ 'dashboard' } /> Dashboard </S.MenuItem>
                    <S.MenuItem> <MenuIcon name={ 'suprimentos_listar' } /> Suprimentos </S.MenuItem>
                </S.MenuSection>
                <S.MenuSection>
                    <S.MenuTitle>CLIENTES/FORNECEDORES</S.MenuTitle>
                    <S.MenuItem> <MenuIcon name={ 'usuario_listar' } /> Listar </S.MenuItem>
                    <S.MenuItem active={ active( 'cadastrocliente' ) } onClick={ !active( 'cadastrocliente' ) ? () => trocarListagem( pages.cadastrocliente ) : () => { } }> <MenuIcon name={ 'usuario_adicionar' } /> Cadastro </S.MenuItem>
                </S.MenuSection>
                <S.MenuSection>
                    <S.MenuTitle>LOCAÇÃO</S.MenuTitle>
                    <S.MenuItem active={ active( 'impressoras' ) } onClick={ !active( 'impressoras' ) ? () => trocarListagem( pages.impressoras ) : () => { } }> <MenuIcon name={ 'status_nenhuma' } /> Listar Impressoras </S.MenuItem>
                    <S.MenuItem active={ active( 'atendimentos' ) } onClick={ !active( 'atendimentos' ) ? () => trocarListagem( pages.atendimentos ) : () => { } }> <MenuIcon name={ 'atendimento_listar' } /> Listar Atendimentos </S.MenuItem>
                    <S.MenuItem active={ active( 'cadastroatendimento' ) } onClick={ !active( 'cadastroatendimento' ) ? () => trocarListagem( pages.cadastroatendimento ) : () => { } }> <MenuIcon name={ 'atendimento_adicionar' } /> Novo Atendimento </S.MenuItem>
                </S.MenuSection>
            </S.Actions>

            <S.Footer>
                <S.Logo src='/icon.png' />
                <S.Texts>
                    <Link href='/'>
                        <S.Text>Home</S.Text>
                    </Link>
                    <Link href='/'>
                        <S.Text>Downloads</S.Text>
                    </Link>
                    <S.Text>Upload</S.Text>
                </S.Texts>
                <S.A href='https://github.com/nonam4/mundoeletronico'> Versão { packageInfo.version } </S.A>
            </S.Footer>
        </S.Container>
    )
}

export default SideMenu