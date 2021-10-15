import Icon from '../../Icons/MenuIcon'
import TextField from '../../Inputs/TextField'

import { Dropdown, DropdownItem, Settings } from '../../Header/styles'
import { FilterOption, FilterIndicator } from './styles'

function DropDown(props) {

    return (
        <Dropdown>
            <DropdownItem>
                {props.busca != '' && <FilterIndicator />}
                <Icon name={'filtros'} margin={'0'} title={'Filtros'} />
            </DropdownItem>
            <Settings right={'-90'}>
                <FilterOption>
                    <TextField onChange={(e) => props.setBusca(e.target.value)} value={props.busca} placeholder={'Buscar...'} icon={'buscar'} />
                </FilterOption>
            </Settings>
        </Dropdown>
    )
}

export default DropDown