import { useEffect, useState } from 'react'

import * as H from '../../../components/Header/styles'
import * as S from './styles'

import { getDatas } from '../../../workers/database'

import Icon from '../../../components/Icons/MenuIcon'
import Select from '../../../components/Inputs/Select'
import TextField from '../../../components/Inputs/TextField'

function DropDown ( props ) {
    const [ filterIndicator, setFilterIndicator ] = useState( false )
    const [ filterDefaults, setFilterDefaults ] = useState( false )
    const [ focus, setFocus ] = useState( false )

    const listagens = [ {
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
    }, ]

    useEffect( () => {
        setFilterIndicator( JSON.stringify( props.filters ) != JSON.stringify( props.filterDefaults ) || props.busca != '' )
        setFilterDefaults( false )
    }, [ props.filters, props.busca ] )

    function handleDataChange ( e ) {
        props.setFilters( { ...props.filters, data: e.target.value } )
    }

    function handleListagemChange ( e ) {
        props.setFilters( { ...props.filters, listando: e.target.value } )
    }

    function rollbackFilters () {
        setFilterDefaults( true )
        props.setBusca( '' )
        props.setFilters( props.filterDefaults )
    }

    function toggleFocus () {
        setFocus( !focus )
    }

    return (
        <H.Dropdown forceShow={ focus }>
            <H.DropdownItem>
                { filterIndicator && <S.FilterIndicator /> }
                <Icon name={ 'filtros' } margin={ '0' } title={ 'Filtros' } />
            </H.DropdownItem>
            <H.Settings right={ '-90' }>
                <S.FilterOption>
                    <TextField useRef={ props.searchRef } onFocus={ toggleFocus } onBlur={ toggleFocus } onChange={ ( e ) => props.setBusca( e.target.value ) } value={ props.busca } placeholder={ 'Buscar...' } icon={ 'buscar' } />
                </S.FilterOption>
                <S.FilterOption>
                    <S.FilterItem>
                        <Icon name={ 'calendario' } /> Datas
                    </S.FilterItem>
                    <Select options={ getDatas } valor={ filterDefaults ? props.filterDefaults.data : undefined } onChange={ handleDataChange } />
                </S.FilterOption>
                <S.FilterOption>
                    <S.FilterItem>
                        <Icon name={ 'listando' } /> Listando
                    </S.FilterItem>
                    <Select options={ listagens } onChange={ handleListagemChange } />
                </S.FilterOption>
                <H.SettingsItem show={ filterIndicator } onClick={ () => rollbackFilters() }> <Icon name={ 'desfazer' } /> Limpar Filtros </H.SettingsItem>
            </H.Settings>
        </H.Dropdown>
    )
}

export default DropDown