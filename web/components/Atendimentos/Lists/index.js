import { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useDados } from '../../../contexts/DadosContext'

import MenuIcon from '../../../components/Icons/MenuIcon'
import * as S from './styles'
import * as Database from '../../../workers/database'

export function DragNDrop ( props ) {
    const { colors } = useContext( ThemeContext )
    const atendimentos = props.ordenacao

    return (
        <DragDropContext onDragEnd={ props.handleOnDragEnd }>
            <Droppable droppableId={ props.tecnico }>
                { provided => (
                    <S.Content { ...provided.droppableProps } ref={ provided.innerRef } expandido={ props.expandido }>
                        { atendimentos.map( ( atendimento, index ) =>
                            <Draggable key={ String( atendimento.chave ) } draggableId={ String( atendimento.chave ) } index={ index }>
                                { provided =>
                                    < S.Atendimentos draggable={ true } ref={ provided.innerRef } { ...provided.draggableProps } { ...provided.dragHandleProps }>
                                        <Atendimento { ...{ ...props, chave: atendimento.chave, colors } } />
                                    </S.Atendimentos>
                                }
                            </Draggable>
                        ) }
                        { provided.placeholder }
                    </S.Content>
                ) }
            </Droppable>
        </DragDropContext >
    )
}

export function Simple ( props ) {
    const { colors } = useContext( ThemeContext )
    const atendimentos = props.ordenacao

    return (
        <S.Content expandido={ props.expandido }>
            { atendimentos.map( atendimento =>
                <S.Atendimentos draggable={ false } key={ atendimento.chave }>
                    <Atendimento { ...{ ...props, chave: atendimento.chave, colors } } />
                </S.Atendimentos>
            ) }
        </S.Content>
    )
}

function Atendimento ( { atendimentos, chave, feitos, colors, expandirCadastro, finalizarReabrirCadastro } ) {
    // variaveis do contexto, disponível em todo o sistema
    const { state } = useDados()
    // variaveis disponíveis no contexto
    const { cadastros } = state
    let atendimento = atendimentos[ chave ]
    let cliente = cadastros[ atendimento.cliente.tipo ][ atendimento.cliente.id ]

    function getListaSuprimentos () {
        let motivo = ''
        for ( let id in atendimento.lista ) {
            let suprimento = atendimento.lista[ id ]
            motivo = `${ motivo } -${ suprimento.label }: ${ suprimento.quantidade }un`
        }
        return motivo
    }

    return ( <>
        <S.AtendimentoContent>
            <S.AtendimentoField>
                <S.AtendimentoIndicador>{ atendimento.feito ? 'Feito em' : 'Aberto em' }</S.AtendimentoIndicador>
                <S.AtendimentoDado>{ Database.convertTimestamp( atendimento.feito ? atendimento.dados.ultimaalteracao : atendimento.dados.inicio ) }</S.AtendimentoDado>
            </S.AtendimentoField>
            <S.AtendimentoField>
                <S.AtendimentoIndicador>Cliente</S.AtendimentoIndicador>
                <S.AtendimentoDado>{ cliente.nomefantasia }</S.AtendimentoDado>
            </S.AtendimentoField>
            <S.AtendimentoField>
                <S.AtendimentoIndicador>Cidade</S.AtendimentoIndicador>
                <S.AtendimentoDado>{ cliente.endereco.cidade }</S.AtendimentoDado>
            </S.AtendimentoField>
            <S.AtendimentoField>
                <S.AtendimentoIndicador>Motivos</S.AtendimentoIndicador>
                <S.AtendimentoDado>{ atendimento.motivos.map( motivo => `-${ motivo } ` ) } { getListaSuprimentos() }</S.AtendimentoDado>
            </S.AtendimentoField>
        </S.AtendimentoContent>
        <S.Settings>
            <S.Button onClick={ () => expandirCadastro( chave ) } hover={ colors.azul } title={ 'Editar' }> <MenuIcon name='atendimento_editar' margin='0' /> </S.Button>
            <S.Button onClick={ () => { finalizarReabrirCadastro( chave ) } } hover={ feitos ? colors.vermelho : colors.verde } title={ feitos ? 'Reabrir' : 'Finalizar' }>
                <MenuIcon name={ feitos ? 'atendimento_reabrir' : 'atendimento_finalizar' } margin='0' />
            </S.Button>
        </S.Settings>
    </> )
}