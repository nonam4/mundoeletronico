import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from 'styled-components'

import MenuIcon from '../../../../components/Icons/MenuIcon'
import TextField  from '../../../../components/Inputs/SimpleTextField'
import Select from '../../../../components//Inputs/Select'
import { Botao } from '../styles'

import { Container, Titulo, TituloSubcontainer, DadosContainer, DadosSubcontainer, DadosTitulo,
         Dados, DadosTrocas, TrocaContainer, TrocaSubcontainer, Troca, Dropdown, DropdownList, DropdownItem } from './styles'

function Impressoras(props) {
    const { colors } = useContext(ThemeContext)
    const capacidades = [{ label: 'Não controlado', value: 'ilimitado' }, { label: '2000 págs', value: '2000' }, { label: '5000 págs', value: '5000' },
                         { label: '10000 págs', value: '10000' }, { label: '15000 págs', value: '15000' }, { label: '20000 págs', value: '20000' }]
    const meses = {'01':'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'}
    const contadores = props.impressora.contadores[props.data]
    const data = props.data.split('-')
    //variaveis alteráveis pelo usuário
    const [impressora, setImpressora] = useState(props.impressora)
    const [franquia, setFranquia] = useState(`${impressora.franquia.limite} págs`)
    const [setor, setSetor] = useState(impressora.setor)

    useEffect(() => {
        setImpressora(props.impressora)
        setFranquia(`${props.impressora.franquia.limite} págs`)
        setSetor(props.impressora.setor)
    }, [props.cliente])

    function deletarImpressora() {
        if(!impressora.contabilizar) return props.setObjectData(`impressoras.${impressora.serial}.contabilizar`, false)
        props.setObjectData(`impressoras.${impressora.serial}.contabilizar`, false)
    }

    function trocarImpressora(serial) {

        let nova = props.cliente.impressoras[serial]
        let velha = impressora

        //define a nova com o mesmo setor e a mesma franquia
        nova.setor = velha.setor
        nova.franquia.limite = velha.franquia.limite
        //adiciona o serial da velha para a lista de substituida e reaproveita toda a lista de substituições
        nova.substituindo = [...nova.substituindo, ...velha.substituindo, velha.serial]
        //verifica se a lista de substituições da nova tem o seu próprio serial
        if (nova.substituindo.indexOf(nova.serial) > -1) nova.substituindo.splice(nova.substituindo.indexOf(nova.serial), 1)

        velha.substituida = true
        velha.substituindo = []

        props.setObjectData('impressoras', {...props.cliente.impressoras, [nova.serial]: nova, [velha.serial]: velha})
    }
    
    function handleFocusFranquia() {
        let number = franquia.split(' ')
        setFranquia(number[0])
    }

    function handleDigitarFranquia(e) {
        if (!isNaN(e.target.value)) return setFranquia(e.target.value)
    }
 
    function handleBlurFranquia() {
        props.setObjectData(`impressoras.${impressora.serial}.franquia.limite`, Number(franquia)) //atualiza o valor no objeto pai para atualizar tudo
        setFranquia(`${Number(franquia)} págs`) //coloca 'pags' na frente da franquia (visual)
    }

    function handleCapacidadeChange(e) {
        props.setObjectData(`impressoras.${impressora.serial}.tintas.capacidade`, e.target.value)
    }

    function handleSetorChange(e) {
        setSetor(e.target.value)
    }

    function handleBlurSetor() {
        props.setObjectData(`impressoras.${impressora.serial}.setor`, setor)
    }

    function getPorcentagemTinta() {
        // 100% - (("x = 100" * (resultado do contador atual menos o contador de quando foi cheio)) / capacidade)
        if(isNaN(impressora.tintas.capacidade)) return '-'
        let porcentagem = parseInt(100 - ((100 * (impressora.contador - impressora.tintas.abastecido)) / impressora.tintas.capacidade ))
        return `${porcentagem <= 0? 0 : porcentagem} %`
    }

    function renderTrocas() {
        const cliente = props.cliente
        let views = []

        for (let serial of impressora.substituindo) {
            let troca = cliente.impressoras[serial]
            if(!troca) continue
            let contador = troca.contadores[props.data]
            if(!contador) continue

            views.push(
                <Troca key={serial}>
                    <DadosSubcontainer>
                        <DadosTitulo> Modelo / Serial / Impresso / Período / Contadores </DadosTitulo>
                        <Dados>
                            {troca.modelo} - {serial} - {contador.impresso} págs {<br/>}
                            {contador.primeiro.dia} a {contador.ultimo.dia} de {meses[data[1]]} - {contador.primeiro.contador} a {contador.ultimo.contador} págs
                        </Dados>
                    </DadosSubcontainer>
                </Troca>
            )
        }

        return views
    }

    function renderSeriaisTrocas() {
        let views = []
        let impressoras = props.cliente.impressoras
        for(let serial in impressoras) {
            
            if (!impressoras[serial].contabilizar || impressoras[serial].substituida || !impressoras[serial] || 
                !impressoras[serial].contadores[props.data] || serial == impressora.serial) continue

            views.push(<DropdownItem key={serial} onClick={() => trocarImpressora(serial)}> {impressoras[serial].modelo} - {serial} </DropdownItem>) 
        }
        return views
    }

    return (
        <Container height={props.cliente.franquia.tipo}> 
            <Titulo>
                {props.impressora.modelo}
                <TituloSubcontainer>
                    {props.cliente.impressorasAtivas > 1 && <Dropdown>
                        <Botao title={'Substituir'} hover={colors.azul}><MenuIcon name={'impressora_trocar'} margin='0' /></Botao>
                        <DropdownList> {renderSeriaisTrocas()} </DropdownList>
                    </Dropdown>}
                    <Botao title={'Excluir'} onClick={() => deletarImpressora()} hover={colors.vermelho}>
                        <MenuIcon name={impressora.contabilizar? 'impressora_deletar' : 'status_ok'} margin='0' /> 
                    </Botao>
                </TituloSubcontainer>
            </Titulo>
            <DadosContainer>
                <DadosSubcontainer>
                    <DadosTitulo> Setor </DadosTitulo>
                    <Dados> <TextField onChange={handleSetorChange} value={setor} onBlur={handleBlurSetor} /> </Dados>
                </DadosSubcontainer>
            </DadosContainer>

            <DadosContainer>
                <DadosSubcontainer>
                    <DadosTitulo> Serial </DadosTitulo>
                    <Dados> {impressora.serial} </Dados>
                </DadosSubcontainer>
                <DadosSubcontainer>
                    <DadosTitulo> IP </DadosTitulo>
                    <Dados> {impressora.ip} </Dados>
                </DadosSubcontainer>
                <DadosSubcontainer>
                    <DadosTitulo> Impresso/mês </DadosTitulo>
                    {contadores? contadores.adicionaltroca > 0? 
                        <DadosTrocas>{contadores.impresso}<span> + {contadores.adicionaltroca} págs</span></DadosTrocas> : 
                        <Dados>{contadores.impresso} págs</Dados> :
                        <Dados>-</Dados>
                    }
                </DadosSubcontainer>
            </DadosContainer>

            <DadosContainer show={props.cliente.franquia.tipo == 'maquina'? true : false}>
                <DadosSubcontainer>
                    <DadosTitulo> Franquia </DadosTitulo>
                    <Dados> 
                        {props.user.permissoes.clientes.financeiro && <TextField onChange={handleDigitarFranquia} value={franquia} onFocus={handleFocusFranquia} onBlur={handleBlurFranquia} />}                        
                        {!props.user.permissoes.clientes.financeiro && franquia}
                    </Dados>
                </DadosSubcontainer>
                <DadosSubcontainer>
                    <DadosTitulo> Excedentes/mês </DadosTitulo>
                    <Dados> { contadores? `${contadores.excedentes} págs` : '-' } </Dados>
                </DadosSubcontainer>
            </DadosContainer>

            <DadosContainer>
                <DadosSubcontainer>
                    <DadosTitulo> Inicial/mês </DadosTitulo>
                    <Dados> { contadores? `${contadores.primeiro.dia} de ${meses[data[1]]} - ${contadores.primeiro.contador} págs` : '-' } </Dados>
                </DadosSubcontainer>
                <DadosSubcontainer>
                    <DadosTitulo> Final/mês </DadosTitulo>
                    <Dados> { contadores? `${contadores.ultimo.dia} de ${meses[data[1]]} - ${contadores.ultimo.contador} págs` : '-'} </Dados>
                </DadosSubcontainer>
            </DadosContainer>

            <DadosContainer>
                <DadosSubcontainer>
                    <DadosTitulo> Rendimento </DadosTitulo>
                    <Dados> <Select valor={impressora.tintas.capacidade} options={capacidades} onChange={handleCapacidadeChange} /> </Dados>
                </DadosSubcontainer>
                <DadosSubcontainer>
                    <DadosTitulo> Nível/tinta </DadosTitulo>
                    <Dados> {getPorcentagemTinta()} </Dados>
                </DadosSubcontainer>
            </DadosContainer>
            
            {contadores && impressora.substituindo.length > 0 && contadores.adicionaltroca > 0 && <TrocaContainer>
                <DadosSubcontainer>
                    <Dados> Substituindo </Dados>
                    <TrocaSubcontainer>{renderTrocas()}</TrocaSubcontainer>
                </DadosSubcontainer>
            </TrocaContainer>}
        </Container>
    )
}

export default Impressoras