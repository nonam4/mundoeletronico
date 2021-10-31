import { useState, useEffect, useContext, memo } from 'react'
import { useDados } from '../../../contexts/DadosContext'
import { ThemeContext } from 'styled-components'

import set from 'lodash/fp/set'

import * as Relatorio from '../../../workers/relatorio'
import MenuIcon from '../../Icons/MenuIcon'
import Select from '../../Inputs/Select'
import TextField from '../../Inputs/SimpleTextField'
import Impressoras from './Impressoras'

import * as S from './styles'

function Expandido ( props ) {

    const { colors } = useContext( ThemeContext )
    const { state, dispatch } = useDados()
    const { expandido, cadastros, filtros } = props

    //valor padrão do select de tipo de franquias
    const franquias = [ { label: 'Ilimitada', value: 'ilimitado' }, { label: 'Por página', value: 'pagina' }, { label: 'Por máquina', value: 'maquina' } ]
    // define se o container está visivível ou não, para uma transição suave
    const [ show, setShow ] = useState( false )
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
        setShow( true )
    }, [] )

    useEffect( () => {
        if ( !expandido ) return
        // toda vez que o valor dos props for alterado irá definir o cadastro local
        // transforma em string e retransforma para json para criar uma cópia sem referência
        setCadastro( JSON.parse( JSON.stringify( expandido ) ) )
    }, [ props.expandido ] )

    useEffect( () => {
        if ( !cadastro ) return
        setFranquiaPagina( cadastro.franquia.tipo === 'pagina' ? true : false )
        setValorFranquiaPagina( `${ cadastro.franquia.limite } págs` )
        setVpe( cadastro.franquia.vpe === 0 ? 'R$ 0,00' : `R$ ${ String( cadastro.franquia.vpe ).replace( '.', ',' ) }` )

    }, [ cadastro ] )

    useEffect( () => {
        if ( !rollback ) return
        setCadastro( JSON.parse( JSON.stringify( expandido ) ) )
        setRollback( false )
    }, [ rollback ] )

    function salvar () {
        props.salvarExpandido( cadastro )
        fechar()
    }

    function fechar () {
        setShow( false )
        setTimeout( () => {
            props.fecharExpandido()
        }, 300 )
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
        setCadastro( recalcularDados( set( keys, value, cadastro ) ) )
    }

    function recalcularDados ( cadastro ) {
        const data = filtros.data

        function getDatas () {
            let datas = []
            let data = new Date()
            let ano = data.getFullYear()
            let mes = data.getMonth() + 1

            for ( var x = 0; x < 4; x++ ) {
                datas.push( { value: ano + '-' + ( mes < 10 ? `0${ mes }` : mes ), label: ( mes < 10 ? `0${ mes }` : mes ) + '/' + ano } )

                if ( mes <= 1 ) {
                    mes = 12
                    ano = ano - 1
                } else {
                    mes--
                }
            }
            return datas
        }

        function getDiasPassados ( mes, dia ) {
            let agora = new Date()
            let leitura = new Date( `${ mes }-${ dia }` )

            //se a diferença de dias entre a data da ultima leitura for maior que 5 dias retorna falso
            if ( Math.ceil( Math.abs( agora - leitura ) / ( 1000 * 3600 * 24 ) ) > 5 ) return false
            return true
        }

        //verifica leitura do mes atual e do mes anterior se precisar
        function getMesPassado ( impressora ) {
            let contadores = impressora.contadores[ data ]
            //se o contador do mês for válido e os dias dentro do prazo então está tudo ok
            if ( contadores && getDiasPassados( data, contadores.ultimo.dia ) ) return true

            let split = data.split( '-' )
            let ano = Number( split[ 0 ] )
            let mes = Number( split[ 1 ] ) - 1

            if ( mes < 1 ) ano = ano - 1
            if ( mes < 1 ) mes = 12
            if ( mes < 10 ) mes = `0${ mes }`

            let mesPassado = `${ ano }-${ mes }`
            contadores = impressora.contadores[ mesPassado ]
            //se o contador do mês passado for válido e os dias dentro do prazo então está tudo ok
            if ( contadores && getDiasPassados( mesPassado, contadores.ultimo.dia ) ) return true

            //se os filtros forem diferentes do mês atual
            if ( getDatas()[ 0 ].value != data ) return true

            return false
        }

        cadastro.impresso = 0
        cadastro.excedentes = 0
        cadastro.impressorasAtivas = 0
        cadastro.atraso = false
        cadastro.abastecimento = false

        let impressorasAtrasadas = 0 //variável de controle de impressoras com atrasos em leituras
        let impressoras = cadastro.impressoras
        for ( let serial in impressoras ) {

            let impressora = impressoras[ serial ]
            let contadores = impressora.contadores[ data ]
            let impresso = 0
            if ( !impressora.contabilizar || impressora.substituida || !impressora ) continue //se a impressora estiver substituida, invalida ou não contabilizar pulará para a proxima            
            if ( ( impressora.contador - impressora.tintas.abastecido ) >= impressora.tintas.capacidade ) cadastro.abastecimento = true
            if ( !getMesPassado( impressora ) ) impressorasAtrasadas += 1

            cadastro.impressorasAtivas += 1

            if ( !contadores ) continue
            //precisa sempre resetar os excedentes dos contadores para evitar bugs ao alterar a franquia no site
            contadores.excedentes = 0
            contadores.adicionaltroca = 0

            if ( impressora.substituindo.length > 0 ) { //essa impressora está substituindo alguma outra?
                for ( let index in impressora.substituindo ) {
                    let serialSubstituido = impressora.substituindo[ index ]
                    let impressoraSubstituida = cadastro.impressoras[ serialSubstituido ]

                    if ( !impressoraSubstituida || !impressoraSubstituida.contadores[ data ] ) continue //se a impressora substituida não existir ou não tiver leitura ela será ignorada

                    impresso += impressoraSubstituida.contadores[ data ].impresso //incrementa com o total impresso das maquinas que sairam
                    contadores.adicionaltroca += impressoraSubstituida.contadores[ data ].impresso
                }
            }

            //após definir o valor impresso pelas maquinas que sairam, incrementamos os valores da impressora atual também
            impresso += contadores.impresso
            //definimos se tem excedentes com base na franquia da maquina comparado ao total impresso das trocas + impresso atual
            if ( impresso > impressora.franquia.limite ) contadores.excedentes = impresso - impressora.franquia.limite
            //incrementa o total impresso no controle geral do cadastro
            cadastro.impresso += impresso

            switch ( cadastro.franquia.tipo ) {
                case 'maquina':
                    cadastro.excedentes += contadores.excedentes
                    break
                case 'pagina':
                    if ( cadastro.impresso > cadastro.franquia.limite ) cadastro.excedentes = cadastro.impresso - cadastro.franquia.limite
                    break
                case 'ilimitado':
                    cadastro.excedentes = cadastro.impresso
                    break
            }
        }
        //se apenas uma impressora apenas estiver com atraso não irá dizer que o sistema não está coletando para esse cadastro
        //e não o marcará como um cadastro com atraso, mas se o numero de impressoras ativas for igual que o numero de impressoras
        //atrasadas daí sim irá indicar que não está coletandos
        if ( impressorasAtrasadas >= cadastro.impressorasAtivas ) cadastro.atraso = true

        return cadastro
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

    function renderImpressoras () {
        const data = filtros.data
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

            views.push( <Impressoras key={ serial } { ...{ data, impressora, setObjectData, cadastro, rollback, setCadastro, recalcularDados } } /> )
        }
        return views
    }

    return (
        <S.Container show={ show }>
            { cadastro && <>
                <S.Botoes>
                    { compareParentData() && <S.Botao onClick={ () => setRollback( true ) } hover={ colors.azul } title='Desfazer'> <MenuIcon name='desfazer' margin='0.8' /> </S.Botao> }
                    <S.Botao onClick={ () => gerarRelatorio() } hover={ colors.azul } title='Gerar Relatório'> <MenuIcon name='relatorio' margin='0.8' /> </S.Botao>
                    <S.Botao onClick={ () => { console.log( 'editando' ) } } hover={ colors.azul } title='Editar Cliente'> <MenuIcon name='usuario_editar' margin='0.8' /> </S.Botao>
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
                    <S.FranquiaContainer>
                        <S.FranquiaSubcontainer border={ state.usuario.permissoes.clientes.financeiro }>
                            <S.FranquiaItem>
                                <S.FranquiaTitulo> Tipo de franquia </S.FranquiaTitulo>
                                <S.FranquiaDado>
                                    { state.usuario.permissoes.clientes.financeiro && <Select valor={ cadastro.franquia.tipo } options={ franquias } onChange={ handleFranquiaChange } /> }
                                    { !state.usuario.permissoes.clientes.financeiro && getFranquia( cadastro.franquia.tipo ) }
                                </S.FranquiaDado>
                            </S.FranquiaItem>
                            <S.FranquiaItem show={ franquiaPagina }>
                                <S.FranquiaTitulo> Franquia </S.FranquiaTitulo>
                                <S.FranquiaDado>
                                    <TextField onChange={ handleDigitarFranquiaPagina } value={ valorFranquiaPagina } onFocus={ handleFocusFranquiaPagina } onBlur={ handleBlurFranquiaPagina } />
                                </S.FranquiaDado>
                            </S.FranquiaItem>
                            <S.FranquiaItem border={ false }>
                                <S.FranquiaTitulo> Total impresso </S.FranquiaTitulo>
                                <S.FranquiaDado> { cadastro.impresso } págs </S.FranquiaDado>
                            </S.FranquiaItem>
                        </S.FranquiaSubcontainer>
                        { state.usuario.permissoes.clientes.financeiro && <S.FranquiaSubcontainer border={ false }>
                            <S.FranquiaItem>
                                <S.FranquiaTitulo> Valor por excedente </S.FranquiaTitulo>
                                <S.FranquiaDado>
                                    <TextField onChange={ handleDigitarVpe } value={ vpe } onBlur={ handleBlurVpe } />
                                </S.FranquiaDado>
                            </S.FranquiaItem>
                            <S.FranquiaItem border={ false } bottom={ false }>
                                <S.FranquiaTitulo> Excedentes </S.FranquiaTitulo>
                                <S.FranquiaDado>
                                    { cadastro.excedentes } págs - { ( cadastro.franquia.vpe * cadastro.excedentes ).toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) }
                                </S.FranquiaDado>
                            </S.FranquiaItem>
                        </S.FranquiaSubcontainer> }
                    </S.FranquiaContainer>

                    { !rollback && renderImpressoras() }
                </S.Listagem>
            </> }
        </S.Container>
    )
}

export default memo( Expandido )