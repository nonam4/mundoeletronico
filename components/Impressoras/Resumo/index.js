import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { ThemeContext } from 'styled-components'

import * as S from './styles'

import Icon from '../../../components/Icons/MenuIcon'

function ClienteResumo ( props ) {
    const router = useRouter()
    const { colors } = useContext( ThemeContext )
    const [ hoverColor, setHoverColor ] = useState( colors.azul )
    const [ iconName, setIconName ] = useState( 'status_ok' )
    const [ iconTitle, setIconTitle ] = useState( 'Tudo Ok!' )

    const { cadastro } = props

    useEffect( () => {
        if ( cadastro.sistema.versao === 'N/I' ) {
            setHoverColor( colors.vermelho )
            setIconName( 'status_desinstalado' )
            setIconTitle( 'Coletor não instalado' )
        } else if ( cadastro.atraso ) {
            setHoverColor( colors.laranja )
            setIconName( 'status_atraso' )
            setIconTitle( 'Atraso em leituras' )
        } else if ( cadastro.sistema.versao != props.version ) {
            setHoverColor( colors.amarelo )
            setIconName( 'status_desatualizado' )
            setIconTitle( 'Coletor desatualizado' )
        } else if ( Object.keys( cadastro.impressoras ).length == 0 ) {
            setHoverColor( colors.verde )
            setIconName( 'status_nenhuma' )
            setIconTitle( 'Nenhuma impressora' )
        } else if ( cadastro.abastecimento ) {
            setHoverColor( colors.magenta )
            setIconName( 'status_abastecimento' )
            setIconTitle( 'Abastecimento necessário' )
        } else {
            setHoverColor( colors.azul )
            setIconName( 'status_ok' )
            setIconTitle( 'Tudo Ok!' )
        }
    }, [ props.cadastro ] )

    function expandirCadastro ( id ) {
        router.push( `/impressoras/${ id }` )

        /*
        router.push({
            pathname: '/impressoras/[expandido]',
            query: { expandido: id },
        })
        */
    }

    return (
        <S.Container hoverColor={ hoverColor } onClick={ () => expandirCadastro( cadastro.id ) }>
            <S.Header>
                <S.NomeContainer>
                    <S.Nome>{ cadastro.nomefantasia }</S.Nome>
                    <S.Subnome>{ cadastro.razaosocial }</S.Subnome>
                </S.NomeContainer>
                <S.IconContainer> <Icon color={ hoverColor } name={ iconName } title={ iconTitle } /> </S.IconContainer>
            </S.Header>
            <S.Line>
                <S.LineItem>
                    <S.LineTitle>Impresso</S.LineTitle>
                    <S.LineText>{ cadastro.impresso } págs</S.LineText>
                </S.LineItem>
                <S.LineItem>
                    <S.LineTitle>Excedentes</S.LineTitle>
                    <S.LineText>{ cadastro.excedentes } págs</S.LineText>
                </S.LineItem>
            </S.Line>
            <S.Line>
                <S.LineItem>
                    <S.LineTitle>Impressoras</S.LineTitle>
                    <S.LineSubtext>{ cadastro.impressorasAtivas }</S.LineSubtext>
                </S.LineItem>
                <S.LineItem>
                    <S.LineTitle>Versão</S.LineTitle>
                    <S.LineSubtext>{ cadastro.sistema.versao }</S.LineSubtext>
                </S.LineItem>
            </S.Line>
        </S.Container>
    )
}

export default ClienteResumo