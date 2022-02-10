import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDados } from '../../../contexts/DadosContext'
import { ThemeContext } from 'styled-components'

import * as S from './styles'

import Icon from '../../../components/Icons/MenuIcon'

function CadastroResumo ( props ) {
    const router = useRouter()
    const { dispatch } = useDados()
    const { colors } = useContext( ThemeContext )
    const [ hoverColor, setHoverColor ] = useState( colors.azul )
    const [ iconName, setIconName ] = useState( 'status_ok' )
    const [ iconTitle, setIconTitle ] = useState( 'Tudo Ok!' )

    const { cadastro, filtros } = props

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

    function setLoad ( valor ) {
        if ( typeof valor !== 'boolean' ) throw new Error( 'Valor para "Load" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setLoad', payload: valor } )
    }

    function expandirCadastro ( id ) {
        let paginaAtual = router.pathname.replace( '/', '' )
        setLoad( true )

        setTimeout( () => {
            router.push( {
                pathname: paginaAtual,
                query: {
                    id, stack: 'cadastroimpressoras',
                    data: filtros.data,
                }
            } )
        }, 200 )
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
                    { cadastro.excedentes > 0 ?
                        cadastro.excedenteadicional > 0 && cadastro.franquia.tipo !== 'ilimitado' ? <S.LineText>{ cadastro.excedentes } <span> + { cadastro.excedenteadicional } págs</span></S.LineText> :
                            <S.LineText>{ cadastro.excedentes } págs</S.LineText> :
                        <S.LineText>-</S.LineText> }
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

export default CadastroResumo