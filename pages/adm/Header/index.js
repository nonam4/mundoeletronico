import { withTheme } from 'styled-components'
import Icon from '../../../components/Icons/MenuIcon'

import { Container, Dropdown, DropdownItem, Foto, Settings, SettingsItem } from './styles'

function Header(props) {

    return (
        <Container>
            <Dropdown>
                <DropdownItem>
                    <Foto src={props.user.foto}/>
                    {props.user.nome}
                </DropdownItem>
                <Settings right={'-3'}>
                    <SettingsItem> <Icon name={'usuario_editar'} /> Perfil </SettingsItem>
                    <SettingsItem onClick={props.toggleTheme}> <Icon name={'tema'} /> Tema {props.theme.title === 'light' ? 'escuro' : 'claro'} </SettingsItem>
                    <SettingsItem onClick={() => props.handleUserChanges(null)}> <Icon name={'logout'} /> Logout </SettingsItem>
                </Settings>
            </Dropdown>
            {props.children}
        </Container>
    )
}

export default withTheme(Header)