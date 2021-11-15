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
    const [ expandido, setExpandido ] = useState( false )
    const [ sempreVisivel, setSempreVisivel ] = useState( false )

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
        }
    }

    // monitora redimensionamentos da tela
    useEffect( () => {
        function handleResize () { setSempreVisivel( window.innerWidth > 833 ) }

        // define se o menu está expandido ao iniciar o aplicativo
        setExpandido( window.innerWidth > 833 )
        handleResize()
        window.addEventListener( 'resize', handleResize )

        return () => window.removeEventListener( 'resize', handleResize )
    }, [] )

    useEffect( () => {
        if ( sempreVisivel ) setExpandido( true )
        if ( !sempreVisivel && expandido ) setExpandido( false )
    }, [ sempreVisivel ] )

    function toggleLoad () {
        dispatch( { type: 'setLoad', payload: !state.load } )
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
        return item == router.pathname.replace( '/', '' )
    }

    return (
        <S.Container expandido={ expandido } sempreVisivel={ sempreVisivel }>
            { !sempreVisivel &&
                <S.Expansor expandido={ expandido } onClick={ () => setExpandido( !expandido ) } >
                    <MenuIcon size={ '18' } margin={ '0' } title={ 'Expandir/Recolher' } name={ expandido ? 'arrow_lft' : 'arrow_rgt' } />
                </S.Expansor> }

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
                    <S.MenuItem> <MenuIcon name={ 'atendimento_adicionar' } /> Novo Atendimento </S.MenuItem>
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