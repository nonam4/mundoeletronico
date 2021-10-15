import { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import MenuIcon from '../../Icons/MenuIcon'
import { Content, Atendimentos, AtendimentoContent, AtendimentoField, AtendimentoIndicador, AtendimentoDado, Settings, Button } from './styles'

function getData(timestamp) {
    let data = new Date(timestamp['_seconds'] * 1000)
    let dia = data.getDate() < 10 ? '0' + data.getDate() : data.getDate()
    let mes = (data.getMonth() + 1) < 10 ? '0' + (data.getMonth() + 1) : data.getMonth() + 1
    let ano = data.getFullYear()

    let hora = data.getHours() < 10 ? '0' + data.getHours() : data.getHours()
    let minutos = data.getMinutes() < 10 ? '0' + data.getMinutes() : data.getMinutes()

    return `${dia}/${mes}/${ano} - ${hora}:${minutos}`
}

export function DragNDrop(props) {
    const { colors } = useContext(ThemeContext)
    const atendimentos = props.atendimentos

    return (
        <DragDropContext onDragEnd={props.handleOnDragEnd}>
            <Droppable droppableId={props.tecnico}>
                {provided => (
                    <Content {...provided.droppableProps} ref={provided.innerRef} expandido={props.expandido}>
                        {Object.keys(atendimentos).map((id, index) =>
                            <Draggable key={id} draggableId={id} index={index}>
                                {provided =>
                                    <Atendimentos draggable={true} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                        <AtendimentoContent>
                                            <AtendimentoField>
                                                <AtendimentoIndicador>Cliente</AtendimentoIndicador>
                                                <AtendimentoDado>{atendimentos[id].cliente.nomefantasia}</AtendimentoDado>
                                            </AtendimentoField>
                                            <AtendimentoField>
                                                <AtendimentoIndicador>Cidade</AtendimentoIndicador>
                                                <AtendimentoDado>{atendimentos[id].cliente.endereco.cidade}</AtendimentoDado>
                                            </AtendimentoField>
                                            <AtendimentoField>
                                                <AtendimentoIndicador>{atendimentos[id].feito ? 'Feito em' : 'Aberto em'}</AtendimentoIndicador>
                                                <AtendimentoDado>{getData(atendimentos[id].feito ? atendimentos[id].dados.fim : atendimentos[id].dados.inicio)}</AtendimentoDado>
                                            </AtendimentoField>
                                            <AtendimentoField>
                                                <AtendimentoIndicador>Motivos</AtendimentoIndicador>
                                                <AtendimentoDado>{atendimentos[id].motivo.map(motivo => `-${motivo} `)}</AtendimentoDado>
                                            </AtendimentoField>
                                        </AtendimentoContent>
                                        <Settings>
                                            <Button hover={colors.azul} title={'Editar'}> <MenuIcon name='atendimento_editar' margin='0' /> </Button>
                                            <Button hover={props.feitos? colors.vermelho : colors.verde} title={props.feitos? 'Reabrir' : 'Finalizar'}> 
                                                <MenuIcon name={props.feitos? 'atendimento_reabrir' : 'atendimento_finalizar'} margin='0' />
                                            </Button>
                                        </Settings>
                                    </Atendimentos>
                                }
                            </Draggable>
                        )}
                        {provided.placeholder}
                    </Content>
                )}
            </Droppable>
        </DragDropContext>
    )
}

export function Simple(props) {
    const { colors } = useContext(ThemeContext)
    const atendimentos = props.atendimentos

    return (
        <Content expandido={props.expandido}>
            {Object.keys(atendimentos).map((id) =>

                <Atendimentos draggable={false} key={id}>
                    <AtendimentoContent>
                        <AtendimentoField>
                            <AtendimentoIndicador>Cliente</AtendimentoIndicador>
                            <AtendimentoDado>{atendimentos[id].cliente.nomefantasia}</AtendimentoDado>
                        </AtendimentoField>
                        <AtendimentoField>
                            <AtendimentoIndicador>Cidade</AtendimentoIndicador>
                            <AtendimentoDado>{atendimentos[id].cliente.endereco.cidade}</AtendimentoDado>
                        </AtendimentoField>
                        <AtendimentoField>
                            <AtendimentoIndicador>{atendimentos[id].feito ? 'Feito em' : 'Aberto em'}</AtendimentoIndicador>
                            <AtendimentoDado>{getData(atendimentos[id].feito ? atendimentos[id].dados.fim : atendimentos[id].dados.inicio)}</AtendimentoDado>
                        </AtendimentoField>
                        <AtendimentoField>
                            <AtendimentoIndicador>Motivos</AtendimentoIndicador>
                            <AtendimentoDado>{atendimentos[id].motivo.map(motivo => `-${motivo} `)}</AtendimentoDado>
                        </AtendimentoField>
                    </AtendimentoContent>
                    <Settings>
                        <Button hover={colors.azul} title={'Editar'}> <MenuIcon name='atendimento_editar' margin='0' /> </Button>
                        <Button hover={props.feitos? colors.vermelho : colors.verde} title={props.feitos? 'Reabrir' : 'Finalizar'}> 
                            <MenuIcon name={props.feitos? 'atendimento_reabrir' : 'atendimento_finalizar'} margin='0' />
                        </Button>
                    </Settings>
                </Atendimentos>
            )}
        </Content>
    )
}