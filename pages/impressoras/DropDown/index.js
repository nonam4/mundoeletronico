import { useEffect, useState } from 'react'

import { Dropdown, DropdownItem, Settings, SettingsItem } from '../../../components/Header/styles'
import { FilterOption, FilterItem, FilterIndicator } from './styles'

import Icon from '../../../components/Icons/MenuIcon'
import Select from '../../../components/Inputs/Select'
import TextField from '../../../components/Inputs/TextField'

function DropDown( props ) {
    const [filterIndicator, setFilterIndicator] = useState( false )
    const [filterDefaults, setFilterDefaults] = useState( false )
    const [focus, setFocus] = useState( false )

    const listagens = [{
        value: 'todos',
        label: 'Todos'
    }, {
        value: 'excedentes',
        label: 'Excedentes'
    }, {
        value: 'atrasos',
        label: 'Atrasos'
    }, {
        value: 'abastecimentos',
        label: 'Abastecimentos'
    },]

    useEffect( () => {
        setFilterIndicator( JSON.stringify( props.filters ) != JSON.stringify( props.filterDefaults ) || props.busca != '' )
        setFilterDefaults( false )
    }, [props.filters, props.busca] )

    function handleDataChange( e ) {
        props.setFilters( { ...props.filters, data: e.target.value } )
    }

    function handleListagemChange( e ) {
        props.setFilters( { ...props.filters, listando: e.target.value } )
    }

    function rollbackFilters() {
        setFilterDefaults( true )
        props.setBusca( '' )
        props.setFilters( props.filterDefaults )
    }

    function toggleFocus() {
        setFocus( !focus )
    }

    return (
        <Dropdown forceShow={ focus }>
            <DropdownItem>
                { filterIndicator && <FilterIndicator /> }
                <Icon name={ 'filtros' } margin={ '0' } title={ 'Filtros' } />
            </DropdownItem>
            <Settings right={ '-90' }>
                <FilterOption>
                    <TextField useRef={ props.searchRef } onFocus={ toggleFocus } onBlur={ toggleFocus } onChange={ ( e ) => props.setBusca( e.target.value ) } value={ props.busca } placeholder={ 'Buscar...' } icon={ 'buscar' } />
                </FilterOption>
                <FilterOption>
                    <FilterItem>
                        <Icon name={ 'calendario' } /> Datas
                    </FilterItem>
                    <Select options={ props.getDatas() } valor={ filterDefaults ? props.filterDefaults.data : undefined } onChange={ handleDataChange } />
                </FilterOption>
                <FilterOption>
                    <FilterItem>
                        <Icon name={ 'listando' } /> Listando
                    </FilterItem>
                    <Select options={ listagens } onChange={ handleListagemChange } />
                </FilterOption>
                <SettingsItem show={ filterIndicator } onClick={ () => rollbackFilters() }> <Icon name={ 'desfazer' } /> Limpar Filtros </SettingsItem>
            </Settings>
        </Dropdown>
    )
}

export default DropDown