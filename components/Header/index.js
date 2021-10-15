import { withTheme } from 'styled-components'
import Icon from '../Icons/MenuIcon'
import { useDados } from '../../contexts/DadosContext'

import * as S from './styles'

import claro from '../../styles/temas/claro'
import escuro from '../../styles/temas/escuro'

function Header( { children } ) {
    const { state, dispatch } = useDados() // variaveis do contexto
    const { usuario, tema } = state

    function toggleTema() {
        // se os dados do usuário estiverem no contexto usará a preferência dele
        if ( tema.title === 'claro' ) dispatch( { type: 'setTema', payload: escuro } )
        if ( tema.title === 'escuro' ) dispatch( { type: 'setTema', payload: claro } )
    }

    return (
        <S.Container>
            <S.Dropdown>
                <S.DropdownItem>
                    <S.Foto src={ usuario.foto } />
                    { usuario.nome }
                </S.DropdownItem>
                <S.Settings right={ '-3' }>
                    <S.SettingsItem> <Icon name={ 'usuario_editar' } /> Perfil </S.SettingsItem>
                    <S.SettingsItem onClick={ toggleTema }> <Icon name={ 'tema' } /> Tema { tema.title === 'claro' ? 'escuro' : 'claro' } </S.SettingsItem>
                    <S.SettingsItem onClick={ () => props.handleUserChanges( null ) }> <Icon name={ 'logout' } /> Logout </S.SettingsItem>
                </S.Settings>
            </S.Dropdown>
            { children }
        </S.Container>
    )
}

export default withTheme( Header )