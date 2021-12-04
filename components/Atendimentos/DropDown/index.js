import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import Icon from '../../../components/Icons/MenuIcon'
import TextField from '../../../components/Inputs/TextField'

import * as H from '../../../components/Header/styles'
import * as S from './styles'

function DropDown ( props ) {
    const router = useRouter()
    const buscaPadrao = ''
    // ultimo filtro aplicado com sucesso
    const [ ultimaBusca, setUltimaBusca ] = useState( buscaPadrao )
    // novo filtro alterado pelo usuario
    const [ novaBusca, setNovaBusca ] = useState( buscaPadrao )
    // usado para definir se irá mostrar a bolinha indicadora de filtro
    const [ usandoFiltro, setUsandoFiltro ] = useState( false )
    // controle do foco da busca pelo ctrl f
    const [ focus, setFocus ] = useState( false )

    useEffect( () => {
        // quando os filtros ou a busca mudarem, define se estão usando os filtros padrões ou não
        setUsandoFiltro( novaBusca !== buscaPadrao )

        // primeiro define que o último filtro usado é o mesmo que o novo filtro modificado
        setUltimaBusca( props.busca )
    }, [ props.busca ] )

    function handleBuscaChange ( e ) {
        // a busca é local então sempre que atualizar a busca atualiza o filtro controle também
        setNovaBusca( e.target.value )
    }

    function aplicarNovoFiltro () {
        // define o filtro de busca como o novo filtro modificado
        props.setBusca( novaBusca )
    }

    function voltarBuscaPadrao () {
        // retorna a busca para o padrão
        setNovaBusca( buscaPadrao )
        setUltimaBusca( buscaPadrao )
        props.setBusca( buscaPadrao )
    }

    function toggleFocus () {
        setFocus( !focus )
    }

    function mostrarBotaoAplicar () {
        return novaBusca !== ultimaBusca
    }

    return (
        <H.Dropdown forceShow={ focus }>
            <H.DropdownItem>
                { usandoFiltro && <S.FilterIndicator /> }
                <Icon name={ 'filtros' } margin={ '0' } title={ 'Filtros' } />
            </H.DropdownItem>
            <H.SettingsContainer right={ '-90' }><H.Settings>
                { !router.query.stack && <S.FilterOption>
                    <TextField useRef={ props.buscaRef } onFocus={ toggleFocus } onBlur={ toggleFocus } onChange={ handleBuscaChange } value={ novaBusca } placeholder={ 'Buscar...' } icon={ 'buscar' } />
                </S.FilterOption> }
                <H.SettingsItem show={ mostrarBotaoAplicar() } onClick={ () => aplicarNovoFiltro() }> <Icon name={ 'aplicar' } /> Aplicar Filtros </H.SettingsItem>
                <H.SettingsItem show={ usandoFiltro } onClick={ () => voltarBuscaPadrao() }> <Icon name={ 'desfazer' } /> Limpar Filtros </H.SettingsItem>
            </H.Settings></H.SettingsContainer>
        </H.Dropdown>
    )
}

export default DropDown