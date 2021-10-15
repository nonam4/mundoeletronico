import Link from 'next/link'
import { useEffect, useState } from 'react'
import packageInfo from '../../package.json'

import MenuIcon from '../Icons/MenuIcon'
import * as S from './styles'

function SideMenu( props ) {
    const [expandido, setExpandido] = useState( false )
    const [sempreVisivel, setSempreVisivel] = useState( false )

    // monitora redimensionamentos da tela
    useEffect( () => {
        function handleResize() { setSempreVisivel( window.innerWidth > 833 ) }

        // define se o menu está expandido ao iniciar o aplicativo
        setExpandido( window.innerWidth > 833 )
        handleResize()
        window.addEventListener( 'resize', handleResize )
        return () => window.removeEventListener( 'resize', handleResize )
    }, [] )

    useEffect( () => {
        if ( sempreVisivel ) setExpandido( true )
        if ( !sempreVisivel && expandido ) setExpandido( false )
    }, [sempreVisivel] )

    function trocarListagem( listagem ) {
        //props.setLoad(true)
        setTimeout( () => {
            //props.setListando(listagem)
            //props.setLoad(false)
        }, 300 )
    }

    function resetarCadastro( listagem ) {
        //props.setEditarCadastro(false)
        trocarListagem( listagem )
    }

    function active( item ) {
        //return item == props.listando
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
                    <S.MenuItem active={ active( 'clientes' ) } onClick={ !active( 'clientes' ) ? () => resetarCadastro( 'clientes' ) : () => { } }> <MenuIcon name={ 'usuario_adicionar' } /> { props.editarCadastro && active( 'clientes' ) ? 'Editar Cadastro' : 'Cadastrar' } </S.MenuItem>
                </S.MenuSection>
                <S.MenuSection>
                    <S.MenuTitle>LOCAÇÃO</S.MenuTitle>
                    <S.MenuItem active={ active( 'impressoras' ) } onClick={ !active( 'impressoras' ) ? () => trocarListagem( 'impressoras' ) : () => { } }> <MenuIcon name={ 'status_nenhuma' } /> Listar Impressoras </S.MenuItem>
                    <S.MenuItem active={ active( 'atendimentos' ) } onClick={ !active( 'atendimentos' ) ? () => trocarListagem( 'atendimentos' ) : () => { } }> <MenuIcon name={ 'atendimento_listar' } /> Listar Atendimentos </S.MenuItem>
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