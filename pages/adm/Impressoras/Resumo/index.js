import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from 'styled-components'

import { Container, Header, NomeContainer, Nome, Subnome, IconContainer, Line, LineItem, LineTitle, LineText, LineSubtext } from './styles'
import Icon from '../../../../components/Icons/MenuIcon'

function ClienteResumo(props) {
    const { colors } = useContext(ThemeContext)
    const [hoverColor, setHoverColor] = useState(colors.azul)
    const [iconName, setIconName] = useState('status_ok')
    const [iconTitle, setIconTitle] = useState('Tudo Ok!')

    const cliente = props.cliente

    useEffect(() => {
        if(cliente.sistema.versao === 'N/I') {
            setHoverColor(colors.vermelho) 
            setIconName('status_desinstalado')
            setIconTitle('Coletor não instalado')
        } else if(cliente.atraso) {
            setHoverColor(colors.laranja)
            setIconName('status_atraso')
            setIconTitle('Atraso em leituras')
        } else if(cliente.sistema.versao != props.version) {
            setHoverColor(colors.amarelo)
            setIconName('status_desatualizado')
            setIconTitle('Coletor desatualizado')
        } else if(Object.keys(cliente.impressoras).length == 0) {
            setHoverColor(colors.verde)
            setIconName('status_nenhuma')
            setIconTitle('Nenhuma impressora')
        } else if(cliente.abastecimento) {
            setHoverColor(colors.magenta)
            setIconName('status_abastecimento')
            setIconTitle('Abastecimento necessário')
        } else {
            setHoverColor(colors.azul)
            setIconName('status_ok')
            setIconTitle('Tudo Ok!')
        }
    }, [props.cliente])

    return (
        <Container hoverColor={hoverColor} onClick={() => props.expandirCliente(cliente.id)}>
            <Header>
                <NomeContainer>
                    <Nome>{cliente.nomefantasia}</Nome>
                    <Subnome>{cliente.razaosocial}</Subnome>
                </NomeContainer>
                <IconContainer> <Icon color={hoverColor} name={iconName} title={iconTitle}/> </IconContainer>
            </Header>
            <Line>
                <LineItem>
                    <LineTitle>Impresso</LineTitle>
                    <LineText>{cliente.impresso} págs</LineText>
                </LineItem>
                <LineItem>
                    <LineTitle>Excedentes</LineTitle>
                    <LineText>{cliente.excedentes} págs</LineText>
                </LineItem>
            </Line>
            <Line>
                <LineItem>
                    <LineTitle>Impressoras</LineTitle>
                    <LineSubtext>{cliente.impressorasAtivas}</LineSubtext>
                </LineItem>
                <LineItem>
                    <LineTitle>Versão</LineTitle>
                    <LineSubtext>{cliente.sistema.versao}</LineSubtext>
                </LineItem>
            </Line>
        </Container>
    )
}

export default ClienteResumo