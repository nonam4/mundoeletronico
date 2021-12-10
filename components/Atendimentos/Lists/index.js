import { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import MenuIcon from '../../../components/Icons/MenuIcon'
import * as S from './styles'
import * as Database from '../../../workers/database'

export function DragNDrop ( props ) {
    const { colors } = useContext( ThemeContext )
    const atendimentos = props.atendimentos

    return (
        <DragDropContext onDragEnd={ props.handleOnDragEnd }>
            <Droppable droppableId={ props.tecnico }>
                { provided => (
                    <S.Content { ...provided.droppableProps } ref={ provided.innerRef } expandido={ props.expandido }>
                        { Object.keys( atendimentos ).map( ( id, index ) =>
                            <Draggable key={ id } draggableId={ id } index={ index }>
                                { provided =>
                                    <S.Atendimentos draggable={ true } ref={ provided.innerRef } { ...provided.draggableProps } { ...provided.dragHandleProps }>
                                        <Atendimento { ...{ ...props, atendimentos, id, colors } } />
                                    </S.Atendimentos>
                                }
                            </Draggable>
                        ) }
                        { provided.placeholder }
                    </S.Content>
                ) }
            </Droppable>
        </DragDropContext>
    )
}

export function Simple ( props ) {
    const { colors } = useContext( ThemeContext )
    const atendimentos = props.atendimentos

    return (
        <S.Content expandido={ props.expandido }>
            { Object.keys( atendimentos ).map( ( id ) =>

                <S.Atendimentos draggable={ false } key={ id }>
                    <Atendimento { ...{ ...props, atendimentos, id, colors } } />
                </S.Atendimentos>
            ) }
        </S.Content>
    )
}

function Atendimento ( { atendimentos, id, feitos, colors, expandirCadastro, finalizarReabrirCadastro } ) {
    return ( <>
        <S.AtendimentoContent>
            <S.AtendimentoField>
                <S.AtendimentoIndicador>{ atendimentos[ id ].feito ? 'Feito em' : 'Aberto em' }</S.AtendimentoIndicador>
                <S.AtendimentoDado>{ Database.convertTimestamp( atendimentos[ id ].feito ? atendimentos[ id ].dados.ultimaalteracao : atendimentos[ id ].dados.inicio ) }</S.AtendimentoDado>
            </S.AtendimentoField>
            <S.AtendimentoField>
                <S.AtendimentoIndicador>Cliente</S.AtendimentoIndicador>
                <S.AtendimentoDado>{ atendimentos[ id ].cliente.nomefantasia }</S.AtendimentoDado>
            </S.AtendimentoField>
            <S.AtendimentoField>
                <S.AtendimentoIndicador>Cidade</S.AtendimentoIndicador>
                <S.AtendimentoDado>{ atendimentos[ id ].cliente.endereco.cidade }</S.AtendimentoDado>
            </S.AtendimentoField>
            <S.AtendimentoField>
                <S.AtendimentoIndicador>Motivos</S.AtendimentoIndicador>
                <S.AtendimentoDado>{ atendimentos[ id ].motivo.map( motivo => `-${ motivo } ` ) }</S.AtendimentoDado>
            </S.AtendimentoField>
        </S.AtendimentoContent>
        <S.Settings>
            <S.Button onClick={ () => expandirCadastro( id ) } hover={ colors.azul } title={ 'Editar' }> <MenuIcon name='atendimento_editar' margin='0' /> </S.Button>
            <S.Button onClick={ () => { finalizarReabrirCadastro( id ) } } hover={ feitos ? colors.vermelho : colors.verde } title={ feitos ? 'Reabrir' : 'Finalizar' }>
                <MenuIcon name={ feitos ? 'atendimento_reabrir' : 'atendimento_finalizar' } margin='0' />
            </S.Button>
        </S.Settings>
    </> )
}