import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from 'styled-components'
import { useDados } from '../../../../contexts/DadosContext'

import MenuIcon from '../../../Icons/MenuIcon'
import TextField from '../../../Inputs/SimpleTextField'
import Select from '../../../Inputs/Select'
import { Botao } from '../styles'

import * as S from './styles'

function Impressoras ( props ) {
    const { state } = useDados()
    const { colors } = useContext( ThemeContext )
    const capacidades = [ { label: 'Não controlado', value: 'ilimitado' }, { label: '2000 págs', value: '2000' }, { label: '5000 págs', value: '5000' },
    { label: '10000 págs', value: '10000' }, { label: '15000 págs', value: '15000' }, { label: '20000 págs', value: '20000' } ]
    const meses = { '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez' }
    const contadores = props.impressora.contadores[ props.data ]
    const data = props.data.split( '-' )
    //variaveis alteráveis pelo usuário
    const [ impressora, setImpressora ] = useState( props.impressora )
    const [ franquia, setFranquia ] = useState( `${ impressora.franquia.limite } págs` )
    const [ setor, setSetor ] = useState( impressora.setor )

    useEffect( () => {
        setImpressora( props.impressora )
        setFranquia( `${ props.impressora.franquia.limite } págs` )
        setSetor( props.impressora.setor )
    }, [ props.cadastro ] )

    function deletarImpressora () {
        if ( !impressora.contabilizar ) return props.setObjectData( `impressoras.${ impressora.serial }.contabilizar`, false )
        props.setObjectData( `impressoras.${ impressora.serial }.contabilizar`, false )
    }

    function trocarImpressora ( serial ) {

        let nova = props.cadastro.impressoras[ serial ]
        let velha = impressora

        //define a nova com o mesmo setor e a mesma franquia
        nova.setor = velha.setor
        nova.franquia.limite = velha.franquia.limite
        //adiciona o serial da velha para a lista de substituida e reaproveita toda a lista de substituições
        nova.substituindo = [ ...nova.substituindo, ...velha.substituindo, velha.serial ]
        //verifica se a lista de substituições da nova tem o seu próprio serial
        if ( nova.substituindo.indexOf( nova.serial ) > -1 ) nova.substituindo.splice( nova.substituindo.indexOf( nova.serial ), 1 )

        velha.substituida = true
        velha.substituindo = []

        props.setObjectData( 'impressoras', { ...props.cadastro.impressoras, [ nova.serial ]: nova, [ velha.serial ]: velha } )
    }

    function handleFocusFranquia () {
        let number = franquia.split( ' ' )
        setFranquia( number[ 0 ] )
    }

    function handleDigitarFranquia ( e ) {
        if ( !isNaN( e.target.value ) ) return setFranquia( e.target.value )
    }

    function handleBlurFranquia () {
        props.setObjectData( `impressoras.${ impressora.serial }.franquia.limite`, Number( franquia ) ) //atualiza o valor no objeto pai para atualizar tudo
        setFranquia( `${ Number( franquia ) } págs` ) //coloca 'pags' na frente da franquia (visual)
    }

    function handleCapacidadeChange ( e ) {
        props.setObjectData( `impressoras.${ impressora.serial }.tintas.capacidade`, e.target.value )
    }

    function handleSetorChange ( e ) {
        setSetor( e.target.value )
    }

    function handleBlurSetor () {
        props.setObjectData( `impressoras.${ impressora.serial }.setor`, setor )
    }

    function getPorcentagemTinta () {
        // 100% - (("x = 100" * (resultado do contador atual menos o contador de quando foi cheio)) / capacidade)
        if ( isNaN( impressora.tintas.capacidade ) ) return '-'
        let porcentagem = parseInt( 100 - ( ( 100 * ( impressora.contador - impressora.tintas.abastecido ) ) / impressora.tintas.capacidade ) )
        return `${ porcentagem <= 0 ? 0 : porcentagem } %`
    }

    function renderTrocas () {
        const cadastro = props.cadastro
        let views = []

        for ( let serial of impressora.substituindo ) {
            let troca = cadastro.impressoras[ serial ]
            if ( !troca ) continue
            let contador = troca.contadores[ props.data ]
            if ( !contador ) continue

            views.push(
                <S.Troca key={ serial }>
                    <S.DadosSubcontainer>
                        <S.DadosTitulo> Modelo / Serial / Impresso / Período / Contadores </S.DadosTitulo>
                        <S.Dados>
                            { troca.modelo } - { serial } - { contador.impresso } págs { <br /> }
                            { contador.primeiro.dia } a { contador.ultimo.dia } de { meses[ data[ 1 ] ] } - { contador.primeiro.contador } a { contador.ultimo.contador } págs
                        </S.Dados>
                    </S.DadosSubcontainer>
                </S.Troca>
            )
        }

        return views
    }

    function renderSeriaisTrocas () {
        let views = []
        let impressoras = props.cadastro.impressoras
        for ( let serial in impressoras ) {

            if ( !impressoras[ serial ].contabilizar || impressoras[ serial ].substituida || !impressoras[ serial ] ||
                !impressoras[ serial ].contadores[ props.data ] || serial == impressora.serial ) continue

            views.push( <S.DropdownItem key={ serial } onClick={ () => trocarImpressora( serial ) }> { impressoras[ serial ].modelo } - { serial } </S.DropdownItem> )
        }
        if ( views.length > 0 ) return views
        return false
    }

    return (
        <S.Container height={ props.cadastro.franquia.tipo }>
            <S.Titulo>
                { props.impressora.modelo }
                <S.TituloSubcontainer>
                    { props.cadastro.impressorasAtivas > 1 && renderSeriaisTrocas() && <S.Dropdown>
                        <Botao title={ 'Substituir' } hover={ colors.azul }><MenuIcon name={ 'impressora_trocar' } margin='0' /></Botao>
                        <S.DropdownList> { renderSeriaisTrocas() } </S.DropdownList>
                    </S.Dropdown> }
                    <Botao title={ 'Excluir' } onClick={ () => deletarImpressora() } hover={ colors.vermelho }>
                        <MenuIcon name={ impressora.contabilizar ? 'impressora_deletar' : 'status_ok' } margin='0' />
                    </Botao>
                </S.TituloSubcontainer>
            </S.Titulo>
            <S.DadosContainer>
                <S.DadosSubcontainer>
                    <S.DadosTitulo> Setor </S.DadosTitulo>
                    <S.Dados> <TextField onChange={ handleSetorChange } value={ setor } onBlur={ handleBlurSetor } /> </S.Dados>
                </S.DadosSubcontainer>
            </S.DadosContainer>

            <S.DadosContainer>
                <S.DadosSubcontainer>
                    <S.DadosTitulo> Serial </S.DadosTitulo>
                    <S.Dados> { impressora.serial } </S.Dados>
                </S.DadosSubcontainer>
                <S.DadosSubcontainer>
                    <S.DadosTitulo> IP </S.DadosTitulo>
                    <S.Dados> { impressora.ip } </S.Dados>
                </S.DadosSubcontainer>
                <S.DadosSubcontainer>
                    <S.DadosTitulo> Impresso/mês </S.DadosTitulo>
                    { contadores ? contadores.adicionaltroca > 0 ?
                        <S.DadosTrocas>{ contadores.impresso }<span> + { contadores.adicionaltroca } págs</span></S.DadosTrocas> :
                        <S.Dados>{ contadores.impresso } págs</S.Dados> :
                        <S.Dados>-</S.Dados>
                    }
                </S.DadosSubcontainer>
            </S.DadosContainer>

            <S.DadosContainer show={ props.cadastro.franquia.tipo == 'maquina' ? true : false }>
                <S.DadosSubcontainer>
                    <S.DadosTitulo> Franquia </S.DadosTitulo>
                    <S.Dados>
                        { state.usuario.permissoes.clientes.financeiro && <TextField onChange={ handleDigitarFranquia } value={ franquia } onFocus={ handleFocusFranquia } onBlur={ handleBlurFranquia } /> }
                        { !state.usuario.permissoes.clientes.financeiro && franquia }
                    </S.Dados>
                </S.DadosSubcontainer>
                <S.DadosSubcontainer>
                    <S.DadosTitulo> Excedentes/mês </S.DadosTitulo>
                    <S.Dados> { contadores ? `${ contadores.excedentes } págs` : '-' } </S.Dados>
                </S.DadosSubcontainer>
            </S.DadosContainer>

            <S.DadosContainer>
                <S.DadosSubcontainer>
                    <S.DadosTitulo> Inicial/mês </S.DadosTitulo>
                    <S.Dados> { contadores ? `${ contadores.primeiro.dia } de ${ meses[ data[ 1 ] ] } - ${ contadores.primeiro.contador } págs` : '-' } </S.Dados>
                </S.DadosSubcontainer>
                <S.DadosSubcontainer>
                    <S.DadosTitulo> Final/mês </S.DadosTitulo>
                    <S.Dados> { contadores ? `${ contadores.ultimo.dia } de ${ meses[ data[ 1 ] ] } - ${ contadores.ultimo.contador } págs` : '-' } </S.Dados>
                </S.DadosSubcontainer>
            </S.DadosContainer>

            <S.DadosContainer>
                <S.DadosSubcontainer>
                    <S.DadosTitulo> Rendimento </S.DadosTitulo>
                    <S.Dados> <Select valor={ impressora.tintas.capacidade } options={ capacidades } onChange={ handleCapacidadeChange } /> </S.Dados>
                </S.DadosSubcontainer>
                <S.DadosSubcontainer>
                    <S.DadosTitulo> Nível/tinta </S.DadosTitulo>
                    <S.Dados> { getPorcentagemTinta() } </S.Dados>
                </S.DadosSubcontainer>
            </S.DadosContainer>

            { contadores && impressora.substituindo.length > 0 && contadores.adicionaltroca > 0 && <S.TrocaContainer>
                <S.DadosSubcontainer>
                    <S.Dados> Substituindo </S.Dados>
                    <S.TrocaSubcontainer>{ renderTrocas() }</S.TrocaSubcontainer>
                </S.DadosSubcontainer>
            </S.TrocaContainer> }
        </S.Container>
    )
}

export default Impressoras