import { useState, useEffect, useContext, memo } from 'react'
import axios from 'axios'
import set from 'lodash/fp/set'
import { ThemeContext } from 'styled-components'

import Header from '../Header'
import MenuIcon from '../Icons/MenuIcon'
import Checkbox from '../Inputs/Checkbox'
import TextField from '../Inputs/TextField'
import SimpleTextField from '../Inputs/SimpleTextField'

import {
    Container, View, Botoes, Botao, TituloContainer, Titulo, LinhaContainer, LinhaSubContainer, Linha, SubLinha, Spacer, DadosColetor,
    HorarioContainer, HorarioSubcontainer, Horario
} from './styles'

function Expandido(props) {
    const data = new Date()
    const [ultimoHorarioUsado, setUltimoHorarioUsado] = useState({ 0: '08:00', 1: '12:00', 2: '13:30', 3: '18:00' })
    const dias = [{ nome: 'Segunda', index: 'segunda' }, { nome: 'Terça', index: 'terca' }, { nome: 'Quarta', index: 'quarta' },
    { nome: 'Quinta', index: 'quinta' }, { nome: 'Sexta', index: 'sexta' }, { nome: 'Sábado', index: 'sabado' }]
    const limpo = {
        id: data.getTime(), nomefantasia: '', razaosocial: '', cpfcnpj: '', endereco: {
            rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: ''
        }, contato: { email: '', telefone: '', celular: '' },
        horarios: { segunda: { aberto: false }, terca: { aberto: false }, quarta: { aberto: false }, quinta: { aberto: false }, sexta: { aberto: false }, sabado: { aberto: false } },
        sistema: { local: window.btoa('N/I'), versao: 'N/I' }
    }
    //variaveis de controle de interface
    const { colors } = useContext(ThemeContext)
    const [rollback, setRollback] = useState(false)
    const [cadastros, setCadastros] = useState(false) //todos os clientes (usado apenas pelo rollback)
    //valores alteráveis pelo usuário
    const [cadastro, setCadastro] = useState(limpo) //somente o cliente editado

    useEffect(() => {
        props.setLoad(true)
        setCadastros(props.cadastros)
        props.setLoad(false)
    }, [])

    useEffect(() => {
        if (cadastros) setCadastro(JSON.parse(JSON.stringify(cadastros[props.editado])))
    }, [cadastros])

    useEffect(() => {
        if (!rollback) return
        setCadastro(JSON.parse(JSON.stringify(cadastros[props.editado])))
        setUltimoHorarioUsado({ 0: '08:00', 1: '12:00', 2: '13:30', 3: '18:00' })
        setRollback(false)
    }, [rollback, cadastro])

    async function salvar() {
        let aviso = props.notificate('Aviso', 'Salvando dados, aguarde...', 'info')

        await axios.post('/api/salvarcliente', { usuario: props.user, cliente: cadastro }).then(() => {
            //depois que salvou atualiza os dados localmente
            props.notificate('Sucesso', 'Todos os dados foram salvos!', 'success')
            setCadastros({ ...cadastros, [cadastro.id]: cadastro })
        }).catch(err => {
            console.error(err)
            props.notificate('Erro', 'Usuário sem permissão para isso!', 'danger')
        })
        props.removeNotification(aviso)
    }

    function compareParentData() {
        if (!cadastros) return false
        return JSON.stringify(cadastro) != JSON.stringify(cadastros[props.editado])
    }

    function handleInput(e, campo) {
        setCadastro(set(campo, e.target.value, cadastro))
    }

    function modifyString(input, positions, chars) {
        let string = input.split('') //transforma a string em um array de letras
        for (let [i, pos] of positions.entries()) { //adiciona o array de caractéres nos indexes desejados
            string.splice(pos, 0, chars[i])
        }
        return string.join('') //devolve de volta em string novamente
    }

    function formatarCpfcnpj(e, campo) {

        function formatar(input) {
            //caso seja um cpf
            if (input.length < 4) return input
            if (input.length < 7) return modifyString(input, [3], ['.'])
            if (input.length < 10) return modifyString(input, [3, 7], ['.', '.'])
            if (input.length < 12) return modifyString(input, [3, 7, 11], ['.', '.', '-'])
            //caso seja um cnpj
            if (input.length < 13) return modifyString(input, [2, 6, 10], ['.', '.', '/'])
            return modifyString(input, [2, 6, 10, 15], ['.', '.', '/', '-'])
        }

        let text = e.target.value.replace(/-|\/|\./g, '') //faz o replace de traços, barras para frente e pontos
        if (!isNaN(text) && text.length < 15) return setCadastro(set(campo, formatar(text), cadastro))   
    }

    function formatarTelefone(e, campo) {

        function formatar(input) {
            if (input.length == 0) return input

            if (input.length < 3) return modifyString(input, [0], ['('])
            if (input.length < 7) return modifyString(input, [0, 3], ['(', ') '])
            return modifyString(input, [0, 3, 8], ['(', ') ', '-'])
        }

        let text = e.target.value.replace(/\(|\)|\-|\s/g, '') //faz o replace de parenteses, traços e espaços vazios
        if (!isNaN(text) && text.length < 11) return setCadastro(set(campo, formatar(text), cadastro))
    }

    function formatarCelular(e, campo) {

        function formatar(input) {
            if (input.length == 0) return input

            if (input.length < 3) return modifyString(input, [0], ['('])
            if (input.length < 8) return modifyString(input, [0, 3], ['(', ') '])
            return modifyString(input, [0, 3, 9], ['(', ') ', '-'])
        }

        let text = e.target.value.replace(/\(|\)|\-|\s/g, '') //faz o replace de parenteses, traços e espaços vazios
        if (!isNaN(text) && text.length < 12) return setCadastro(set(campo, formatar(text), cadastro))
    }

    function formatarNumero(e, campo) {
        if (!isNaN(e.target.value)) return setCadastro(set(campo, e.target.value, cadastro))
    }

    function formatarCep(e, campo) {

        function formatar(input) {
            if (input.length < 6) return input
            return modifyString(input, [5], ['-'])
        }

        let text = e.target.value.replace(/\-/g, '') //faz o replace de traços
        if (!isNaN(text) && text.length < 9) return setCadastro(set(campo, formatar(text), cadastro))
    }

    function formatarEstado(e, campo) {
        let text = e.target.value.replace(/[^A-Za-z\s!?]|\s/g, '') //remove tudo exceto letras
        if (isNaN(text) || text == 0) return setCadastro(set(campo, text.toUpperCase(), cadastro))
    }

    function setHorarioAberto(dia) {
        setCadastro(set(`horarios.${dia}.aberto`, !cadastro.horarios[dia].aberto, cadastro))
    }

    function getHorario(dia, index) {

        if (!cadastro.horarios[dia].horarios || cadastro.horarios[dia].horarios[index] === undefined) setCadastro(set(`horarios.${dia}.horarios.${index}`, ultimoHorarioUsado[index], cadastro))
        if (!cadastro.horarios[dia].horarios || cadastro.horarios[dia].horarios[index] === undefined) return ultimoHorarioUsado[index]
        return cadastro.horarios[dia].horarios[index]
    }

    function handleHorarioChange(e, dia, index) {
        let input = e.target.value.replace(':', '')
        let a, b

        if (isNaN(input)) return

        if (input === '') return setCadastro(set(`horarios.${dia}.horarios.${index}`, ' ', cadastro))
        //se estiver apenas os dois primeiros numeros e eles forem maiores que 23 definirá como 23
        if (Number(input) > 23 && input.length === 2) return setCadastro(set(`horarios.${dia}.horarios.${index}`, '23', cadastro))
        if (input.length === 1 || input.length === 2) return setCadastro(set(`horarios.${dia}.horarios.${index}`, input, cadastro))

        a = input.substring(0, 2)
        b = input.substring(2, 4)
        if (Number(a) > 23) a = '23'
        if (Number(b) > 5) b = '59'
        if (input.length === 3) return setCadastro(set(`horarios.${dia}.horarios.${index}`, `${a}:${b}`, cadastro))

        a = input.substring(0, 2)
        b = input.substring(2, 5)
        if (Number(a) > 23) a = '23'
        if (Number(b) > 59) b = '59'
        setCadastro(set(`horarios.${dia}.horarios.${index}`, `${a}:${b}`, cadastro))
    }

    function handleBlurHorario(dia, index) {
        let horario = cadastro.horarios[dia].horarios[index].replace(':', '')
        let a, b

        setUltimoHorarioUsado({ ...ultimoHorarioUsado, [`${index}`]: '' })
        if (horario === '' || horario === ' ') return setCadastro(set(`horarios.${dia}.horarios.${index}`, '', cadastro))
        setUltimoHorarioUsado({ ...ultimoHorarioUsado, [`${index}`]: `0${horario}:00` })
        if (horario.length === 1) return setCadastro(set(`horarios.${dia}.horarios.${index}`, `0${horario}:00`, cadastro))
        setUltimoHorarioUsado({ ...ultimoHorarioUsado, [`${index}`]: '23:00' })
        if (horario.length === 2 && Number(horario) > 23) return setCadastro(set(`horarios.${dia}.horarios.${index}`, '23:00', cadastro))
        setUltimoHorarioUsado({ ...ultimoHorarioUsado, [`${index}`]: `${horario}:00` })
        if (horario.length === 2) return setCadastro(set(`horarios.${dia}.horarios.${index}`, `${horario}:00`, cadastro))

        a = horario.substring(0, 2)
        b = `${horario.substring(2, 4)}0`
        if (Number(a) > 23) a = '23'
        if (Number(b) > 59) b = '59'
        setUltimoHorarioUsado({ ...ultimoHorarioUsado, [`${index}`]: `${a}:${b}` })
        if (horario.length === 3) return setCadastro(set(`horarios.${dia}.horarios.${index}`, `${a}:${b}`, cadastro))

        a = horario.substring(0, 2)
        b = horario.substring(2, 5)
        if (Number(a) > 23) a = '23'
        if (Number(b) > 59) b = '59'
        setUltimoHorarioUsado({ ...ultimoHorarioUsado, [`${index}`]: `${a}:${b}` })
        setCadastro(set(`horarios.${dia}.horarios.${index}`, `${a}:${b}`, cadastro))
    }

    function duasLinhasHorarios(dia) {
        if (!cadastro.horarios[dia].horarios) return true
        if (cadastro.horarios[dia].horarios[2] === '' && cadastro.horarios[dia].horarios[3] === '') return false
        return true
    }

    function adicionarSegundaLinhaHorarios(dia) {
        let array = [...cadastro.horarios[dia].horarios]
        array[2] = '13:30'
        array[3] = '18:00'
        setCadastro(set(`horarios.${dia}.horarios`, array, cadastro))
    }

    function renderDias() {
        let views = []
        for (let dia of dias) {
            views.push(
                <HorarioSubcontainer key={dia.index}>
                    <Checkbox text={dia.nome} changeReturn={() => setHorarioAberto(dia.index)} checked={cadastro.horarios[dia.index].aberto} />
                    {cadastro.horarios[dia.index].aberto && <Horario>
                        <SimpleTextField onChange={(e) => handleHorarioChange(e, dia.index, 0)} value={getHorario(dia.index, 0)} maxLength={5} onBlur={() => handleBlurHorario(dia.index, 0)} />
                        <Spacer /> - <Spacer />
                        <SimpleTextField onChange={(e) => handleHorarioChange(e, dia.index, 1)} value={getHorario(dia.index, 1)} maxLength={5} onBlur={() => handleBlurHorario(dia.index, 1)} />
                    </Horario>}
                    {cadastro.horarios[dia.index].aberto && duasLinhasHorarios(dia.index) && <Horario>
                        <SimpleTextField onChange={(e) => handleHorarioChange(e, dia.index, 2)} value={getHorario(dia.index, 2)} maxLength={5} onBlur={() => handleBlurHorario(dia.index, 2)} />
                        <Spacer /> - <Spacer />
                        <SimpleTextField onChange={(e) => handleHorarioChange(e, dia.index, 3)} value={getHorario(dia.index, 3)} maxLength={5} onBlur={() => handleBlurHorario(dia.index, 3)} />
                    </Horario>}
                    {cadastro.horarios[dia.index].aberto && !duasLinhasHorarios(dia.index) && <Horario>
                        <Botao onClick={() => adicionarSegundaLinhaHorarios(dia.index)} hover={colors.azul} title='Adicionar'> <MenuIcon name='arrow_dwn' margin='0' /> </Botao>
                    </Horario>}
                </HorarioSubcontainer>
            )
        }
        return views
    }

    return (
        <Container expanded={props.expanded} desktop={props.desktop}>
            <Header {...props} />
            <View>
                <Botoes>
                    {compareParentData() && <Botao onClick={() => setRollback(true)} hover={colors.azul} title='Desfazer'> <MenuIcon name='desfazer' margin='0.8' /> </Botao>}
                    {compareParentData() && <Botao onClick={() => salvar()} hover={colors.azul} title='Salvar'> <MenuIcon name='salvar' margin='0.8' /> </Botao>}
                    {!cadastro && <Botao onClick={() => { }} hover={colors.azul} title='Fechar'> <MenuIcon name='status_nenhuma' margin='0.8' /> </Botao>}
                </Botoes>
                <TituloContainer>
                    <Titulo> Dados cadastrais </Titulo>
                    <div>
                        <DadosColetor>Chave do cliente: <b> {cadastro.id} </b></DadosColetor>
                        <DadosColetor>Pc com coletor: <b> {window.atob(cadastro.sistema.local)} </b></DadosColetor>
                        <DadosColetor>Versão do coletor: <b>  {cadastro.sistema.versao} </b></DadosColetor>
                    </div>
                </TituloContainer>

                <LinhaContainer>
                    <LinhaSubContainer>
                        <Linha> <TextField placeholder={'Nome Fantasia'} onChange={(e) => handleInput(e, 'nomefantasia')} value={cadastro.nomefantasia} icon={false} maxLength={50} /> </Linha>
                        <Linha> <TextField placeholder={'Razão Social'} onChange={(e) => handleInput(e, 'razaosocial')} value={cadastro.razaosocial} icon={false} maxLength={50} /> </Linha>

                        <SubLinha>
                            <Linha minWidth={'140px'} maxWidth={'140px'}> <TextField placeholder={'CPF/CNPJ'} onChange={(e) => formatarCpfcnpj(e, 'cpfcnpj')} value={cadastro.cpfcnpj} icon={false} /> </Linha>
                            <Spacer />
                            <Linha> <TextField placeholder={'Email'} onChange={(e) => handleInput(e, 'contato.email')} value={cadastro.contato.email} icon={false} maxLength={50} /> </Linha>
                        </SubLinha>

                        <Linha>
                            <Linha> <TextField placeholder={'Telefone'} onChange={(e) => formatarTelefone(e, 'contato.telefone')} value={cadastro.contato.telefone} icon={false} /> </Linha>
                            <Spacer />
                            <Linha> <TextField placeholder={'Celular'} onChange={(e) => formatarCelular(e, 'contato.celular')} value={cadastro.contato.celular} icon={false} /> </Linha>
                        </Linha>
                    </LinhaSubContainer>
                </LinhaContainer>

                <TituloContainer>
                    <Titulo> Endereço </Titulo>
                </TituloContainer>

                <LinhaContainer>
                    <LinhaSubContainer>
                        <Linha>
                            <Linha> <TextField placeholder={'Rua'} onChange={(e) => handleInput(e, 'endereco.rua')} value={cadastro.endereco.rua} icon={false} maxLength={50} /> </Linha>
                            <Spacer />
                            <Linha important={true} minWidth={'65px'} maxWidth={'65px'}> <TextField placeholder={'Número'} onChange={(e) => formatarNumero(e, 'endereco.numero')} value={cadastro.endereco.numero} icon={false} maxLength={5} /> </Linha>
                        </Linha>

                        <SubLinha>
                            <Linha> <TextField placeholder={'Complemento'} onChange={(e) => handleInput(e, 'endereco.complemento')} value={cadastro.endereco.complemento} icon={false} maxLength={100} /> </Linha>
                        </SubLinha>

                        <SubLinha>
                            <Linha> <TextField placeholder={'Bairro'} onChange={(e) => handleInput(e, 'endereco.bairro')} value={cadastro.endereco.bairro} icon={false} maxLength={50} /> </Linha>
                            <Spacer />
                            <Linha margin={'none'} maxWidth={'fit-content'}>
                                <Linha> <TextField placeholder={'Cidade'} onChange={(e) => handleInput(e, 'endereco.cidade')} value={cadastro.endereco.cidade} icon={false} maxLength={50} /> </Linha>
                                <Spacer />
                                <Linha important={true} minWidth={'38px'} maxWidth={'38px'}> <TextField placeholder={'UF'} onChange={(e) => formatarEstado(e, 'endereco.estado')} value={cadastro.endereco.estado.toUpperCase()} icon={false} maxLength={2} /> </Linha>
                                <Spacer />
                                <Linha important={true} minWidth={'82px'} maxWidth={'82px'}> <TextField placeholder={'CEP'} onChange={(e) => formatarCep(e, 'endereco.cep')} value={cadastro.endereco.cep} icon={false} /> </Linha>
                            </Linha>
                        </SubLinha>
                    </LinhaSubContainer>
                </LinhaContainer>

                <TituloContainer>
                    <Titulo> Horários </Titulo>
                </TituloContainer>

                <HorarioContainer>
                    { renderDias() }
                </HorarioContainer>
            </View>
        </Container>
    )
}

export default memo(Expandido)