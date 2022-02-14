import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from 'styled-components'

import MenuIcon from '../../../Icons/MenuIcon'
import { Botao } from '../styles'

import * as S from './styles'

function Impressoras ( props ) {
    const { colors } = useContext( ThemeContext )

    const meses = { '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez' }
    const data = props.data.split( '-' )
    const cadastro = props.cadastro
    const impressora = props.impressora
    const contadores = impressora.contadores[ props.data ]

    const [ franquia, setFranquia ] = useState( `${ impressora.franquia.limite } págs` )
    const [ setor, setSetor ] = useState( impressora.setor )

    useEffect( () => {
        setFranquia( `${ props.impressora.franquia.limite } págs` )
        setSetor( props.impressora.setor )
    }, [ props.cadastro ] )

    function getPorcentagemTinta () {
        // 100% - (("x = 100" * (resultado do contador atual menos o contador de quando foi cheio)) / capacidade)
        if ( isNaN( impressora.tintas.capacidade ) ) return '-'
        let porcentagem = parseInt( 100 - ( ( 100 * ( impressora.contador - impressora.tintas.abastecido ) ) / impressora.tintas.capacidade ) )
        return `${ porcentagem <= 0 ? 0 : porcentagem } %`
    }

    function renderTrocas () {
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
                        <S.DadosTrocas>
                            { troca.modelo } - { serial } - <span>{ contador.impresso } págs</span> { <br /> }
                            { contador.primeiro.dia } a { contador.ultimo.dia } de { meses[ data[ 1 ] ] } - { contador.primeiro.contador } a { contador.ultimo.contador } págs
                        </S.DadosTrocas>
                    </S.DadosSubcontainer>
                </S.Troca>
            )
        }

        return views
    }

    function renderHistoricoContadores () {
        let views = []

        for ( let historico in impressora.historico ) {
            views.push( <S.DropdownHistoricoItem key={ historico } > { impressora.historico[ historico ] } </S.DropdownHistoricoItem> )
        }

        return views.length > 0 ? views : false
    }

    return (
        <S.Container>
            <S.Titulo>
                <S.TituloContainer>
                    <S.TituloModelo>{ impressora.modelo }</S.TituloModelo>
                    <S.TituloSerial>{ impressora.serial }</S.TituloSerial>
                </S.TituloContainer>
                <S.TituloSubcontainer>
                    { renderHistoricoContadores() && <S.Dropdown>
                        <Botao title={ 'Histórico' } hover={ colors.azul }><MenuIcon name={ 'historico' } margin='0' /></Botao>
                        <S.DropdownList> { renderHistoricoContadores() } </S.DropdownList>
                    </S.Dropdown> }
                </S.TituloSubcontainer>
            </S.Titulo>
            <S.DadosContainer>
                <S.DadosSubcontainer>
                    <S.DadosTitulo> Setor </S.DadosTitulo>
                    <S.Dados> { setor } </S.Dados>
                </S.DadosSubcontainer>
            </S.DadosContainer>

            <S.DadosContainer>
                <S.DadosSubcontainer>
                    <S.DadosTitulo> Impresso/mês </S.DadosTitulo>
                    { contadores ? contadores.adicionaltroca > 0 ?
                        <S.Dados>{ contadores.impresso }<span> + { contadores.adicionaltroca } págs</span></S.Dados> :
                        <S.Dados>{ contadores.impresso } págs</S.Dados> :
                        <S.Dados>-</S.Dados> }
                </S.DadosSubcontainer>
                <S.DadosSubcontainer show={ cadastro.franquia.tipo == 'maquina' }>
                    <S.DadosTitulo> Franquia </S.DadosTitulo>
                    <S.Dados>{ franquia }</S.Dados>
                </S.DadosSubcontainer>

                <S.DadosSubcontainer show={ cadastro.franquia.tipo == 'maquina' }>
                    <S.DadosTitulo> Excedentes/mês </S.DadosTitulo>
                    { contadores ? contadores.excedenteadicional > 0 && cadastro.franquia.tipo !== 'ilimitado' ?
                        <S.Dados>{ contadores.excedentes }<span> + { contadores.excedenteadicional }</span> págs</S.Dados> :
                        contadores.excedentes > 0 ? <S.Dados>{ contadores.excedentes } págs</S.Dados> : <S.Dados>-</S.Dados> :
                        <S.Dados>-</S.Dados>
                    }
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
                    <S.DadosTitulo> IP </S.DadosTitulo>
                    <S.Dados> { impressora.ip } </S.Dados>
                </S.DadosSubcontainer>
                <S.DadosSubcontainer>
                    <S.DadosTitulo> Data/instalação </S.DadosTitulo>
                    <S.Dados> { impressora.instalada ? impressora.instalada : '-' } </S.Dados>
                </S.DadosSubcontainer>
                <S.DadosSubcontainer>
                    <S.DadosTitulo> Vista/último </S.DadosTitulo>
                    <S.Dados> { impressora.vistoporultimo ? impressora.vistoporultimo : '-' } </S.Dados>
                </S.DadosSubcontainer>
            </S.DadosContainer>

            <S.DadosContainer>
                <S.DadosSubcontainer>
                    <S.DadosTitulo> Rendimento </S.DadosTitulo>
                    <S.Dados> { impressora.tintas.capacidade !== 'ilimitado' ? `${ impressora.tintas.capacidade } págs` : 'Não controlado' }  </S.Dados>
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