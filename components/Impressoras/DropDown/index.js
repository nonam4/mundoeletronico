import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import * as H from '../../../components/Header/styles'
import * as S from './styles'

import { getDatas } from '../../../workers/database'

import Icon from '../../../components/Icons/MenuIcon'
import Select from '../../../components/Inputs/Select'
import TextField from '../../../components/Inputs/TextField'

function DropDown ( props ) {
    const router = useRouter()
    const filtroPadrao = { listando: 'todos', data: getDatas()[ 0 ].value, busca: '' }
    // ultimo filtro aplicado com sucesso
    const [ ultimoFiltroUsado, setUltimoFiltroUsado ] = useState( filtroPadrao )
    // novo filtro alterado pelo usuario
    const [ novoFiltroUsado, setNovoFiltroUsado ] = useState( filtroPadrao )
    // usado para definir se irá mostrar a bolinha indicadora de filtro
    const [ usandoFiltro, setUsandoFiltro ] = useState( false )
    // usado para definir de volta a data atual no select de datas
    const [ usandoFiltroPadrao, setUsandoFiltroPadrao ] = useState( false )
    // controle do foco da busca pelo ctrl f
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
        // quando os filtros ou a busca mudarem, define se estão usando os filtros padrões ou não
        const a = JSON.stringify( novoFiltroUsado ) !== JSON.stringify( filtroPadrao )

        setUsandoFiltro( a )
        setUsandoFiltroPadrao( false )

        // primeiro define que o último filtro usado é o mesmo que o novo filtro modificado
        setUltimoFiltroUsado( props.filtros )
    }, [ props.filtros ] )

    function handleDataChange ( e ) {
        setNovoFiltroUsado( { ...novoFiltroUsado, data: e.target.value } )
    }

    function handleListagemChange ( e ) {
        setNovoFiltroUsado( { ...novoFiltroUsado, listando: e.target.value } )
    }

    function handleBuscaChange ( e ) {
        // a busca é local então sempre que atualizar a busca atualiza o filtro controle também
        setNovoFiltroUsado( { ...novoFiltroUsado, busca: e.target.value } )
        props.setFiltros( { ...props.filtros, busca: e.target.value } )
    }

    function aplicarNovoFiltro () {
        // define o filtro de busca como o novo filtro modificado
        props.setFiltros( novoFiltroUsado )
    }

    function voltarFiltrosPadrao () {
        // retorna o filtro novo e o filtro de controle para o padrão
        setUsandoFiltroPadrao( true )
        setNovoFiltroUsado( filtroPadrao )
        setUltimoFiltroUsado( filtroPadrao )
        props.setFiltros( filtroPadrao )
    }

    function toggleFocus () {
        setFocus( !focus )
    }

    function mostrarBotaoAplicar () {
        return JSON.stringify( novoFiltroUsado ) !== JSON.stringify( ultimoFiltroUsado )
    }

    return (
        <H.Dropdown forceShow={ focus }>
            <H.DropdownItem>
                { usandoFiltro && <S.FilterIndicator /> }
                <Icon name={ 'filtros' } margin={ '0' } title={ 'Filtros' } />
            </H.DropdownItem>
            <H.SettingsContainer right={ '-90' }><H.Settings>
                { !router.query.stack && <S.FilterOption>
                    <TextField useRef={ props.buscaRef } onFocus={ toggleFocus } onBlur={ toggleFocus } onChange={ handleBuscaChange } value={ novoFiltroUsado.busca } placeholder={ 'Buscar...' } icon={ 'buscar' } />
                </S.FilterOption> }
                <S.FilterOption>
                    <S.FilterItem>
                        <Icon name={ 'calendario' } /> Datas
                    </S.FilterItem>
                    <Select options={ getDatas() } valor={ usandoFiltroPadrao ? filtroPadrao.data : undefined } onChange={ handleDataChange } />
                </S.FilterOption>
                { !router.query.stack && <S.FilterOption>
                    <S.FilterItem>
                        <Icon name={ 'listando' } /> Listando
                    </S.FilterItem>
                    <Select options={ listagens } valor={ novoFiltroUsado.listando } onChange={ handleListagemChange } />
                </S.FilterOption> }
                <H.SettingsItem show={ mostrarBotaoAplicar() } onClick={ () => aplicarNovoFiltro() }> <Icon name={ 'aplicar' } /> Aplicar Filtros </H.SettingsItem>
                <H.SettingsItem show={ usandoFiltro } onClick={ () => voltarFiltrosPadrao() }> <Icon name={ 'desfazer' } /> Limpar Filtros </H.SettingsItem>
            </H.Settings></H.SettingsContainer>
        </H.Dropdown>
    )
}

export default DropDown