import Icon from '../../../components/Icons'
import TextField from '../../../components/Inputs/TextField'

import * as H from '../../../components/Header/styles'
import * as S from './styles'

function DropDown ( props ) {

    return (
        <H.Dropdown>
            <H.DropdownItem>
                { props.busca != '' && <S.FilterIndicator /> }
                <Icon name={ 'filtros' } margin={ '0' } title={ 'Filtros' } />
            </H.DropdownItem>
            <H.Settings right={ '-90' }>
                <S.FilterOption>
                    <TextField onChange={ ( e ) => props.setBusca( e.target.value ) } value={ props.busca } placeholder={ 'Buscar...' } icon={ 'buscar' } />
                </S.FilterOption>
            </H.Settings>
        </H.Dropdown>
    )
}

export default DropDown