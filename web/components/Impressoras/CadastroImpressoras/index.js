import { useState, useEffect, useContext } from 'react'
import { useDados } from '../../../contexts/DadosContext'
import { ThemeContext } from 'styled-components'
import { useRouter } from 'next/router'

import set from 'lodash/fp/set'

import * as Relatorio from '../../../workers/relatorio'
import MenuIcon from '../../Icons/MenuIcon'
import Select from '../../Inputs/Select'
import TextField from '../../Inputs/SimpleTextField'
import Impressoras from './Impressoras'
import ImpressorasInativas from './Impressoras/Inativas'

import * as S from './styles'
import * as Database from '../../../workers/database'
import * as Notification from '../../../workers/notification'

function CadastroExpandido () {

    const { colors } = useContext( ThemeContext )
    const { state, dispatch } = useDados()
    const router = useRouter()
    const permissoes = state.usuario.permissoes

    // pega os filtros passados pela URL
    const [ filtros, setFiltros ] = useState( undefined )
    // variaveis sobre a visibilidade do menu lateral
    const { menuExpandido, sempreVisivel } = state.menu
    // armazena os dados do cadastro expandido
    const [ expandido, setExpandido ] = useState( undefined )
    // valor padrão do select de tipo de franquias
    const franquias = [ { label: 'Ilimitada', value: 'ilimitado' }, { label: 'Por página', value: 'pagina' }, { label: 'Por máquina', value: 'maquina' } ]
    // decide se irá aparecer o botão para desfazer todas as alterações feitas
    const [ rollback, setRollback ] = useState( false )
    // variável local, sem referência à variável do contexto
    const [ cadastro, setCadastro ] = useState( undefined )
    // define o tipo de franquia
    const [ franquiaPagina, setFranquiaPagina ] = useState( false )
    // define o valor da franquia por página
    const [ valorFranquiaPagina, setValorFranquiaPagina ] = useState( '0 págs' )
    // define o Valor Por Excedente
    const [ vpe, setVpe ] = useState( 'R$ 0,00' )

    useEffect( () => {
        console.log( expandido )
    }, [] )

    useEffect( () => {
        setLoad( false )
    }, [ router.query ] )

    useEffect( () => {
        if ( !router.query.id ) return
        setFiltros( { data: router.query.data } )
        setExpandido( state.cadastros[ 'locacao' ][ router.query.id ] )
    }, [ router.query.data, router.query.id, state.cadastros ] )

    useEffect( () => {
        // toda vez que o valor do expandido for alterado irá definir o cadastro local
        // transforma em string e retransforma para json para criar uma cópia sem referência
        if ( !expandido ) return
        setCadastro( JSON.parse( JSON.stringify( expandido ) ) )
    }, [ expandido ] )

    useEffect( () => {
        if ( !cadastro ) return
        setFranquiaPagina( cadastro.franquia.tipo === 'pagina' ? true : false )
        setValorFranquiaPagina( `${ cadastro.franquia.limite } págs` )
        setVpe( cadastro.franquia.vpe === 0 ? 'R$ 0,00' : `R$ ${ String( cadastro.franquia.vpe ).replace( '.', ',' ) }` )
    }, [ cadastro ] )

    useEffect( () => {
        if ( !rollback ) return
        setLoad( true )
        setTimeout( () => {
            setCadastro( JSON.parse( JSON.stringify( expandido ) ) )
            setRollback( false )
            setLoad( false )
        }, 200 )
    }, [ rollback ] )

    function setLoad ( valor ) {
        if ( typeof valor !== 'boolean' ) throw new Error( 'Valor para "Load" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setLoad', payload: valor } )
    }

    function setInCadastros ( cadastro ) {
        // atualiza o cadastro no state para atualizar os dados em todas as outras telas
        dispatch( { type: 'setCadastros', payload: set( `${ cadastro.tipo }.${ cadastro.id }`, cadastro, state.cadastros ) } )
    }

    function editarCadastro ( editado ) {
        let paginaAtual = router.pathname.replace( '/', '' )

        setLoad( true )
        setTimeout( () => {
            router.push( {
                pathname: paginaAtual,
                query: {
                    stack: router.query.stack,
                    stack1: 'cadastrocliente',
                    id: editado.id,
                    data: router.query.data,
                }
            } )
        }, 200 )
    }

    function salvar () {
        let aviso = Notification.notificate( 'Aviso', 'Salvando dados, aguarde...', 'info' )

        Database.salvarCadastro( state.usuario, cadastro ).then( () => {

            Notification.removeNotification( aviso )
            Notification.notificate( 'Sucesso', 'Todos os dados foram salvos!', 'success' )
            // depois que salvou atualiza os dados localmente
            setInCadastros( cadastro )
        } ).catch( err => {
            Notification.removeNotification( aviso )
            console.error( err )
            Notification.notificate( 'Erro', 'Tivemos um problema, tente novamente!', 'danger' )
        } )
    }

    function fechar () {
        let paginaAtual = router.pathname.replace( '/', '' )
        setLoad( true )

        setTimeout( () => {
            router.push( paginaAtual )
        }, [ 200 ] )
    }

    function gerarRelatorio () {
        Relatorio.gerarRelatorio( cadastro, filtros, colors )
    }

    function handleFocusFranquiaPagina () {
        let number = valorFranquiaPagina.split( ' ' )
        setValorFranquiaPagina( number[ 0 ] )
    }

    function handleDigitarFranquiaPagina ( e ) {
        if ( !isNaN( e.target.value ) ) return setValorFranquiaPagina( e.target.value )
    }

    function handleBlurFranquiaPagina () {
        setObjectData( 'franquia.limite', Number( valorFranquiaPagina ) ) //atualiza o valor no objeto do cadastro
        setValorFranquiaPagina( `${ Number( valorFranquiaPagina ) } págs` ) //coloca o 'pags' no valor (visual)
    }

    function handleDigitarVpe ( e ) {
        let value = e.target.value.replace( 'R$', '' ).replace( ',', '.' )
        if ( value.length <= 1 ) { value = '0' + value }
        value = parseFloat( value.replace( /[^\d]/g, '' ).replace( /(\d\d?)$/, '.$1' ) ).toFixed( 2 )

        if ( value.length > 4 ) return
        setVpe( `R$ ${ value.replace( '.', ',' ) }` )
    }

    function handleBlurVpe ( e ) {
        let value = Number( e.target.value.replace( 'R$', '' ).replace( ',', '.' ) )
        setObjectData( 'franquia.vpe', value )
    }

    function handleFranquiaChange ( e ) {

        switch ( e.target.value ) {
            case 'pagina':
                setFranquiaPagina( true )
                setObjectData( 'franquia.tipo', 'pagina' )
                break
            case 'maquina':
                setFranquiaPagina( false )
                setObjectData( 'franquia.tipo', 'maquina' )
                break
            case 'ilimitado':
                setFranquiaPagina( false )
                setObjectData( 'franquia.tipo', 'ilimitado' )
                break
        }
    }

    function setObjectData ( keys, value ) {
        setLoad( true )
        Database.recalcularDados( filtros.data, set( keys, value, cadastro ) ).then( res => {
            console.log( res.data.cadastro )
            setCadastro( res.data.cadastro )
            setLoad( false )
        } )
    }

    function setLocalObjectData ( keys, value ) {
        setCadastro( set( keys, value, cadastro ) )
    }

    function compareParentData () {
        // compara se a entrada 'expandido' é diferente do atual 'cadastro'
        // não causará problemas pois a entrada não tem referencia ao atual
        return JSON.stringify( expandido ) != JSON.stringify( cadastro )
    }

    function getFranquia ( tipo ) {
        for ( let franquia of franquias ) {
            if ( franquia.value == tipo ) return franquia.label
        }
    }

    function renderImpressorasAtivas () {
        const data = filtros.data
        let views = []
        let impressoras = cadastro.impressoras

        if ( Object.keys( impressoras ).length <= 0 ) return views

        for ( let serial in impressoras ) {

            let substituindo = []
            let impressora = impressoras[ serial ]
            if ( !impressora || !impressora.contabilizar || impressora.substituida ) continue

            if ( impressora.substituindo.length > 0 ) { //essa impressora está substituindo alguma outra?

                for ( let index in impressora.substituindo ) {
                    let serialSubstituido = impressora.substituindo[ index ]
                    let impressoraSubstituida = cadastro.impressoras[ serialSubstituido ]

                    if ( !impressoraSubstituida || !impressoraSubstituida.contadores[ data ] ) continue //se a impressora substituida não existir ou não tiver leitura ela será ignorada
                    substituindo.push( impressoraSubstituida )
                }
            }

            views.push( <Impressoras key={ serial } { ...{ data, impressora, cadastro, setObjectData, setLocalObjectData, rollback, setCadastro } } /> )
        }
        return views
    }

    function renderImpressorasInativas () {
        let views = []
        let impressoras = cadastro.impressoras

        if ( Object.keys( impressoras ).length <= 0 ) return views

        for ( let serial in impressoras ) {

            let impressora = impressoras[ serial ]
            if ( !impressora ) continue
            if ( !impressora.contabilizar ) views.push( <ImpressorasInativas key={ serial } { ...{ impressora, cadastro, setObjectData } } /> )
        }
        return views
    }

    return (
        <S.Container expandido={ menuExpandido } sempreVisivel={ sempreVisivel }>
            { cadastro && <>
                <S.Botoes>
                    { compareParentData() && <S.Botao onClick={ () => setRollback( true ) } hover={ colors.azul } title='Desfazer'> <MenuIcon name='desfazer' margin='0.8' /> </S.Botao> }
                    <S.Botao onClick={ () => gerarRelatorio() } hover={ colors.azul } title='Gerar Relatório'> <MenuIcon name='relatorio' margin='0.8' /> </S.Botao>
                    <S.Botao onClick={ () => editarCadastro( cadastro ) } hover={ colors.azul } title='Editar Cliente'> <MenuIcon name='usuario_editar' margin='0.8' /> </S.Botao>
                    { compareParentData() && <S.Botao onClick={ () => salvar() } hover={ colors.azul } title='Salvar/Fechar'> <MenuIcon name='salvar' margin='0.8' /> </S.Botao> }
                    <S.Botao onClick={ () => fechar() } hover={ colors.azul } title='Fechar'> <MenuIcon name='fechar' margin='0' /> </S.Botao>
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
                    { permissoes.clientes.financeiro && <S.FranquiaContainer>
                        <S.FranquiaSubcontainer width={ cadastro.franquia.tipo === 'pagina' ? '60%' : '100%' } borderTop={ false }>
                            <S.FranquiaItem>
                                <S.FranquiaTitulo> Tipo de franquia </S.FranquiaTitulo>
                                <S.FranquiaDado>
                                    <Select valor={ cadastro.franquia.tipo } options={ franquias } onChange={ handleFranquiaChange } />
                                </S.FranquiaDado>
                            </S.FranquiaItem>
                            <S.FranquiaItem show={ franquiaPagina }>
                                <S.FranquiaTitulo> Franquia </S.FranquiaTitulo>
                                <S.FranquiaDado>
                                    <TextField onChange={ handleDigitarFranquiaPagina } value={ valorFranquiaPagina } onFocus={ handleFocusFranquiaPagina } onBlur={ handleBlurFranquiaPagina } />
                                </S.FranquiaDado>
                            </S.FranquiaItem>
                            <S.FranquiaItem border={ false }>
                                <S.FranquiaTitulo> Impresso/mês </S.FranquiaTitulo>
                                <S.FranquiaDado> { cadastro.impresso } págs </S.FranquiaDado>
                            </S.FranquiaItem>
                        </S.FranquiaSubcontainer>
                        <S.FranquiaSubcontainer width={ cadastro.franquia.tipo === 'pagina' ? '40%' : '100%' } borderTop={ true } borderRight={ false }>
                            <S.FranquiaItem>
                                <S.FranquiaTitulo> Valor por { cadastro.franquia.tipo !== 'ilimitado' ? 'excedente' : 'página' } </S.FranquiaTitulo>
                                <S.FranquiaDado>
                                    <TextField onChange={ handleDigitarVpe } value={ vpe } onBlur={ handleBlurVpe } />
                                </S.FranquiaDado>
                            </S.FranquiaItem>
                            <S.FranquiaItem border={ false } bottom={ false }>
                                <S.FranquiaTitulo> { cadastro.franquia.tipo !== 'ilimitado' ? 'Excedentes/mês' : 'Contabilizado/mês' } </S.FranquiaTitulo>
                                { cadastro.excedentes > 0 ?
                                    cadastro.excedenteadicional > 0 && cadastro.franquia.tipo !== 'ilimitado' ?
                                        <S.FranquiaDado>{ cadastro.excedentes }<span>&nbsp;+ { cadastro.excedenteadicional }&nbsp;</span>págs - { ( cadastro.franquia.vpe * ( cadastro.excedentes + cadastro.excedenteadicional ) ).toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) } </S.FranquiaDado> :
                                        <S.FranquiaDado>{ cadastro.excedentes } págs - { ( cadastro.franquia.vpe * cadastro.excedentes ).toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) }</S.FranquiaDado> : <S.FranquiaDado>-</S.FranquiaDado> }
                            </S.FranquiaItem>
                        </S.FranquiaSubcontainer>
                    </S.FranquiaContainer> }

                    { !permissoes.clientes.financeiro && <S.FranquiaContainer>
                        <S.FranquiaSubcontainer width={ cadastro.franquia.tipo === 'ilimitado' ? '33.33%' : '100%' } borderTop={ false } >
                            <S.FranquiaItem border={ cadastro.franquia.tipo !== 'ilimitado' }>
                                <S.FranquiaTitulo> Tipo de franquia </S.FranquiaTitulo>
                                <S.FranquiaDado>
                                    { getFranquia( cadastro.franquia.tipo ) }
                                </S.FranquiaDado>
                            </S.FranquiaItem>
                            <S.FranquiaItem border={ false } show={ franquiaPagina }>
                                <S.FranquiaTitulo> Franquia </S.FranquiaTitulo>
                                <S.FranquiaDado>{ valorFranquiaPagina }</S.FranquiaDado>
                            </S.FranquiaItem>
                        </S.FranquiaSubcontainer>
                        <S.FranquiaSubcontainer width={ cadastro.franquia.tipo === 'ilimitado' ? '66.66%' : '100%' } borderTop={ true } borderRight={ false }>
                            <S.FranquiaItem>
                                <S.FranquiaTitulo> Impresso/mês </S.FranquiaTitulo>
                                <S.FranquiaDado>{ cadastro.impresso > 0 ? `${ cadastro.impresso } págs` : '-' }</S.FranquiaDado>
                            </S.FranquiaItem>
                            <S.FranquiaItem border={ false } bottom={ false }>
                                <S.FranquiaTitulo> { cadastro.franquia.tipo !== 'ilimitado' ? 'Excedentes/mês' : 'Contabilizado/mês' } </S.FranquiaTitulo>
                                { cadastro.excedentes > 0 ?
                                    cadastro.excedenteadicional > 0 && cadastro.franquia.tipo !== 'ilimitado' ?
                                        <S.FranquiaDado>{ cadastro.excedentes } <span> + { cadastro.excedenteadicional } </span>págs </S.FranquiaDado> :
                                        <S.FranquiaDado>{ cadastro.excedentes } págs</S.FranquiaDado> : <S.FranquiaDado>-</S.FranquiaDado> }
                            </S.FranquiaItem>
                        </S.FranquiaSubcontainer>
                    </S.FranquiaContainer> }

                    { !rollback && renderImpressorasAtivas() }
                    { cadastro.impressorasInativas > 0 && <>
                        <S.TituloContainer>
                            <S.TituloSubContainer><S.Titulo>Não contabilizadas</S.Titulo></S.TituloSubContainer>
                        </S.TituloContainer>
                        <S.Listagem><S.Inativas>{ !rollback && renderImpressorasInativas() }</S.Inativas></S.Listagem>
                    </> }
                </S.Listagem>
            </> }
        </S.Container >
    )
}

export default CadastroExpandido