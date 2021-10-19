import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from 'styled-components'

import * as S from './styles'

import Icon from '../../../components/Icons/MenuIcon'

function ClienteResumo ( props ) {
    const { colors } = useContext( ThemeContext )
    const [ hoverColor, setHoverColor ] = useState( colors.azul )
    const [ iconName, setIconName ] = useState( 'status_ok' )
    const [ iconTitle, setIconTitle ] = useState( 'Tudo Ok!' )

    const cliente = props.cliente

    useEffect( () => {
        if ( cliente.sistema.versao === 'N/I' ) {
            setHoverColor( colors.vermelho )
            setIconName( 'status_desinstalado' )
            setIconTitle( 'Coletor não instalado' )
        } else if ( cliente.atraso ) {
            setHoverColor( colors.laranja )
            setIconName( 'status_atraso' )
            setIconTitle( 'Atraso em leituras' )
        } else if ( cliente.sistema.versao != props.version ) {
            setHoverColor( colors.amarelo )
            setIconName( 'status_desatualizado' )
            setIconTitle( 'Coletor desatualizado' )
        } else if ( Object.keys( cliente.impressoras ).length == 0 ) {
            setHoverColor( colors.verde )
            setIconName( 'status_nenhuma' )
            setIconTitle( 'Nenhuma impressora' )
        } else if ( cliente.abastecimento ) {
            setHoverColor( colors.magenta )
            setIconName( 'status_abastecimento' )
            setIconTitle( 'Abastecimento necessário' )
        } else {
            setHoverColor( colors.azul )
            setIconName( 'status_ok' )
            setIconTitle( 'Tudo Ok!' )
        }
    }, [ props.cliente ] )

    return (
        <S.Container hoverColor={ hoverColor } onClick={ () => props.expandirCliente( cliente.id ) }>
            <S.Header>
                <S.NomeContainer>
                    <S.Nome>{ cliente.nomefantasia }</S.Nome>
                    <S.Subnome>{ cliente.razaosocial }</S.Subnome>
                </S.NomeContainer>
                <S.IconContainer> <Icon color={ hoverColor } name={ iconName } title={ iconTitle } /> </S.IconContainer>
            </S.Header>
            <S.Line>
                <S.LineItem>
                    <S.LineTitle>Impresso</S.LineTitle>
                    <S.LineText>{ cliente.impresso } págs</S.LineText>
                </S.LineItem>
                <S.LineItem>
                    <S.LineTitle>Excedentes</S.LineTitle>
                    <S.LineText>{ cliente.excedentes } págs</S.LineText>
                </S.LineItem>
            </S.Line>
            <S.Line>
                <S.LineItem>
                    <S.LineTitle>Impressoras</S.LineTitle>
                    <S.LineSubtext>{ cliente.impressorasAtivas }</S.LineSubtext>
                </S.LineItem>
                <S.LineItem>
                    <S.LineTitle>Versão</S.LineTitle>
                    <S.LineSubtext>{ cliente.sistema.versao }</S.LineSubtext>
                </S.LineItem>
            </S.Line>
        </S.Container>
    )
}

export default ClienteResumo