import { useState, useEffect, useContext } from 'react'
import { useTela } from '../../../contexts/TelaContext'
import { useDados } from '../../../contexts/DadosContext'
import { ThemeContext } from 'styled-components'

import * as Database from '../../../workers/database'

import Select from '../../Inputs/Select'
import MenuIcon from '../../Icons/MenuIcon'
import Impressoras from './Impressoras'

import * as S from './styles'

function CadastroExpandido ( { getDados } ) {

    const { colors } = useContext( ThemeContext )
    const { state, dispatch } = useTela()
    const data = state.data
    const dados = useDados()
    const [ tema, setTema ] = useState( dados.state.tema )
    // valor padrão do select de tipo de franquias
    const franquias = [ { label: 'Ilimitada', value: 'ilimitado' }, { label: 'Por página', value: 'pagina' }, { label: 'Por máquina', value: 'maquina' } ]
    // variável local, sem referência à variável do contexto
    const [ cadastro, setCadastro ] = useState( state.cadastro )
    // define o tipo de franquia
    const [ franquiaPagina, setFranquiaPagina ] = useState( false )
    // define o valor da franquia por página
    const [ valorFranquiaPagina, setValorFranquiaPagina ] = useState( '0 págs' )

    useEffect( () => {
        setData( Database.getDatas()[ 0 ].value )
    }, [] )

    useEffect( () => {
        setCadastro( state.cadastro )
    }, [ state.cadastro ] )

    useEffect( () => {
        setTema( dados.state.tema )
    }, [ dados.state.tema ] )

    useEffect( () => {
        if ( !cadastro ) return
        setFranquiaPagina( cadastro.franquia.tipo === 'pagina' ? true : false )
        setValorFranquiaPagina( `${ cadastro.franquia.limite } págs` )
    }, [ cadastro ] )

    function setLoad ( valor ) {
        if ( typeof valor !== 'boolean' ) throw new Error( 'Valor para "Load" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setLoad', payload: valor } )
    }

    function setData ( valor ) {
        dispatch( { type: 'setData', payload: valor } )
    }

    function toggleTema () {
        if ( tema === 'claro' ) return dados.dispatch( { type: 'setTema', payload: 'escuro' } )
        if ( tema === 'escuro' ) return dados.dispatch( { type: 'setTema', payload: 'claro' } )
        // se não for nem um nem outro é porque não está definido então o tema padrão é claro
        // ou seja, vamos deixar escuro agora
        return dados.dispatch( { type: 'setTema', payload: 'escuro' } )
    }

    function getFranquia ( tipo ) {
        for ( let franquia of franquias ) {
            if ( franquia.value === tipo ) return franquia.label
        }
    }

    function renderImpressoras () {
        let views = []
        let impressoras = cadastro.impressoras

        if ( Object.keys( impressoras ).length <= 0 ) return views

        for ( let serial in impressoras ) {

            let substituindo = []
            let impressora = impressoras[ serial ]

            if ( !impressora.contabilizar || impressora.substituida || !impressora ) continue

            if ( impressora.substituindo.length > 0 ) { //essa impressora está substituindo alguma outra?

                for ( let index in impressora.substituindo ) {
                    let serialSubstituido = impressora.substituindo[ index ]
                    let impressoraSubstituida = cadastro.impressoras[ serialSubstituido ]

                    if ( !impressoraSubstituida || !impressoraSubstituida.contadores[ data ] ) continue //se a impressora substituida não existir ou não tiver leitura ela será ignorada
                    substituindo.push( impressoraSubstituida )
                }
            }

            views.push( <Impressoras key={ serial } { ...{ data, impressora, cadastro } } /> )
        }
        return views
    }

    function handleDataChange ( e ) {
        setLoad( true )
        setData( e.target.value )
        getDados( e.target.value, false )
    }

    function handleGetDados () {
        getDados( data )
    }

    function abrirConfiguracao () {
        setLoad( true )
        setTimeout( () => {
            dispatch( { type: 'setConfigs', payload: true } )
        }, 300 )
    }

    return (
        <>{ cadastro && <S.Container>
            <S.Botoes>
                <S.Botao onClick={ () => toggleTema() } hover={ colors.azul } title={ `Tema ${ tema === 'claro' ? 'escuro' : 'claro' }` }> <MenuIcon name='tema' margin='0' /> </S.Botao>
                <S.Botao onClick={ handleGetDados } hover={ colors.azul } title={ 'Sincronizar' }> <MenuIcon width={ 36 } name='sync' margin='0.4' /> </S.Botao>
                <S.Botao onClick={ abrirConfiguracao } hover={ colors.azul } title={ 'Configurações' }> <MenuIcon name='settings' margin='0' /> </S.Botao>
            </S.Botoes>
            <S.TituloContainer>
                <S.TituloSubContainer>
                    <S.Titulo>{ cadastro.nomefantasia }</S.Titulo>
                    <S.Subtitulo>{ cadastro.razaosocial }</S.Subtitulo>
                </S.TituloSubContainer>
                <S.TituloSubContainer>
                    <S.DadosColetor>Chave do cadastro: <b> { cadastro.id } </b></S.DadosColetor>
                    <S.DadosColetor>Pc com coletor: <b> { window.atob( cadastro.sistema.local ) } </b></S.DadosColetor>
                    <S.DadosColetor>Versão do coletor: <b>  { cadastro.sistema.versao } </b></S.DadosColetor>
                </S.TituloSubContainer>
            </S.TituloContainer>
            <S.Listagem>

                <S.FranquiaContainer>
                    <S.FranquiaSubcontainer borderTop={ false } >
                        <S.FranquiaItem >
                            <S.FranquiaTitulo> Mês/base </S.FranquiaTitulo>
                            <S.FranquiaDado>
                                <Select options={ Database.getDatas() } valor={ data } onChange={ handleDataChange } />
                            </S.FranquiaDado>
                        </S.FranquiaItem>
                        <S.FranquiaItem border={ franquiaPagina }>
                            <S.FranquiaTitulo> Tipo de franquia </S.FranquiaTitulo>
                            <S.FranquiaDado>{ getFranquia( cadastro.franquia.tipo ) }</S.FranquiaDado>
                        </S.FranquiaItem>
                        <S.FranquiaItem border={ false } show={ franquiaPagina }>
                            <S.FranquiaTitulo> Franquia </S.FranquiaTitulo>
                            <S.FranquiaDado>{ valorFranquiaPagina }</S.FranquiaDado>
                        </S.FranquiaItem>
                    </S.FranquiaSubcontainer>
                    <S.FranquiaSubcontainer >
                        <S.FranquiaItem>
                            <S.FranquiaTitulo> Impresso/mês </S.FranquiaTitulo>
                            <S.FranquiaDado> { cadastro.impresso > 0 ? `${ cadastro.impresso } págs` : '-' }</S.FranquiaDado>
                        </S.FranquiaItem>
                        <S.FranquiaItem border={ false } bottom={ false }>
                            <S.FranquiaTitulo> { cadastro.franquia.tipo !== 'ilimitado' ? 'Excedentes/mês' : 'Contabilizado/mês' } </S.FranquiaTitulo>
                            { cadastro.excedentes > 0 ?
                                cadastro.excedenteadicional > 0 && cadastro.franquia.tipo !== 'ilimitado' ?
                                    <S.FranquiaDado>{ cadastro.excedentes } <span> + { cadastro.excedenteadicional } </span>págs </S.FranquiaDado> :
                                    <S.FranquiaDado>{ cadastro.excedentes } págs</S.FranquiaDado> : <S.FranquiaDado>-</S.FranquiaDado> }
                        </S.FranquiaItem>
                    </S.FranquiaSubcontainer>
                </S.FranquiaContainer>

                { renderImpressoras() }
            </S.Listagem>
        </S.Container > }</>
    )
}

export default CadastroExpandido