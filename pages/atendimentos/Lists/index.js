import { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import MenuIcon from '../../Icons/MenuIcon'
import * as S from './styles'

function getData ( timestamp ) {
    let data = new Date( timestamp[ '_seconds' ] * 1000 )
    let dia = data.getDate() < 10 ? '0' + data.getDate() : data.getDate()
    let mes = ( data.getMonth() + 1 ) < 10 ? '0' + ( data.getMonth() + 1 ) : data.getMonth() + 1
    let ano = data.getFullYear()

    let hora = data.getHours() < 10 ? '0' + data.getHours() : data.getHours()
    let minutos = data.getMinutes() < 10 ? '0' + data.getMinutes() : data.getMinutes()

    return `${ dia }/${ mes }/${ ano } - ${ hora }:${ minutos }`
}

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
                                        <S.AtendimentoContent>
                                            <S.AtendimentoField>
                                                <S.AtendimentoIndicador>Cliente</S.AtendimentoIndicador>
                                                <S.AtendimentoDado>{ atendimentos[ id ].cliente.nomefantasia }</S.AtendimentoDado>
                                            </S.AtendimentoField>
                                            <S.AtendimentoField>
                                                <S.AtendimentoIndicador>Cidade</S.AtendimentoIndicador>
                                                <S.AtendimentoDado>{ atendimentos[ id ].cliente.endereco.cidade }</S.AtendimentoDado>
                                            </S.AtendimentoField>
                                            <S.AtendimentoField>
                                                <S.AtendimentoIndicador>{ atendimentos[ id ].feito ? 'Feito em' : 'Aberto em' }</S.AtendimentoIndicador>
                                                <S.AtendimentoDado>{ getData( atendimentos[ id ].feito ? atendimentos[ id ].dados.fim : atendimentos[ id ].dados.inicio ) }</S.AtendimentoDado>
                                            </S.AtendimentoField>
                                            <S.AtendimentoField>
                                                <S.AtendimentoIndicador>Motivos</S.AtendimentoIndicador>
                                                <S.AtendimentoDado>{ atendimentos[ id ].motivo.map( motivo => `-${ motivo } ` ) }</S.AtendimentoDado>
                                            </S.AtendimentoField>
                                        </S.AtendimentoContent>
                                        <S.Settings>
                                            <S.Button hover={ colors.azul } title={ 'Editar' }> <MenuIcon name='atendimento_editar' margin='0' /> </S.Button>
                                            <S.Button hover={ props.feitos ? colors.vermelho : colors.verde } title={ props.feitos ? 'Reabrir' : 'Finalizar' }>
                                                <MenuIcon name={ props.feitos ? 'atendimento_reabrir' : 'atendimento_finalizar' } margin='0' />
                                            </S.Button>
                                        </S.Settings>
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
                    <S.AtendimentoContent>
                        <S.AtendimentoField>
                            <S.AtendimentoIndicador>Cliente</S.AtendimentoIndicador>
                            <S.AtendimentoDado>{ atendimentos[ id ].cliente.nomefantasia }</S.AtendimentoDado>
                        </S.AtendimentoField>
                        <S.AtendimentoField>
                            <S.AtendimentoIndicador>Cidade</S.AtendimentoIndicador>
                            <S.AtendimentoDado>{ atendimentos[ id ].cliente.endereco.cidade }</S.AtendimentoDado>
                        </S.AtendimentoField>
                        <S.AtendimentoField>
                            <S.AtendimentoIndicador>{ atendimentos[ id ].feito ? 'Feito em' : 'Aberto em' }</S.AtendimentoIndicador>
                            <S.AtendimentoDado>{ getData( atendimentos[ id ].feito ? atendimentos[ id ].dados.fim : atendimentos[ id ].dados.inicio ) }</S.AtendimentoDado>
                        </S.AtendimentoField>
                        <S.AtendimentoField>
                            <S.AtendimentoIndicador>Motivos</S.AtendimentoIndicador>
                            <S.AtendimentoDado>{ atendimentos[ id ].motivo.map( motivo => `-${ motivo } ` ) }</S.AtendimentoDado>
                        </S.AtendimentoField>
                    </S.AtendimentoContent>
                    <S.Settings>
                        <S.Button hover={ colors.azul } title={ 'Editar' }> <MenuIcon name='atendimento_editar' margin='0' /> </S.Button>
                        <S.Button hover={ props.feitos ? colors.vermelho : colors.verde } title={ props.feitos ? 'Reabrir' : 'Finalizar' }>
                            <MenuIcon name={ props.feitos ? 'atendimento_reabrir' : 'atendimento_finalizar' } margin='0' />
                        </S.Button>
                    </S.Settings>
                </S.Atendimentos>
            ) }
        </S.Content>
    )
}