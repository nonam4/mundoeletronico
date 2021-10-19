import { useState, useEffect, useRef } from 'react'
import { useDados } from '../../contexts/DadosContext'
import axios from 'axios'
import packageInfo from '../../package.json'

import * as S from './styles'

import MainFrame from '../../components/MainFrame'
import Header from '../../components/Header'
import DropDown from './DropDown'
import Resumo from './Resumo'
import Expandido from './Expandido'

function Impressoras () {
    const { state, dispatch } = useDados() // variaveis do contexto
    const { expandido, sempreVisivel } = state.menu  // variaveis sobre a visibilidade do menu lateral
    const [ busca, setBusca ] = useState( '' ) // auto explicativo
    const searchRef = useRef( null ) // referência do campo de busca para focar automático no ctrl + f

    //variaveis sobre o banco de dados
    const [ clientes, setClientes ] = useState( {} )
    const [ salvandoClientes, setSalvandoClientes ] = useState( false )
    const filterDefaults = { listando: 'todos', data: getDatas()[ 0 ].value }
    const [ filters, setFilters ] = useState( filterDefaults )
    const [ clientesFiltrados, setClientesFiltrados ] = useState( {} ) //clientes locais filtrados pelo campo de busca
    const [ scrollEndingAt, setScrollEndingAt ] = useState( 24 )
    //variaveis do cliente expandido
    const [ clienteExpandido, setClienteExpandido ] = useState( null )

    useEffect( () => {
        window.addEventListener( 'keydown', e => {
            if ( !searchRef || !searchRef.current ) return
            if ( e.ctrlKey && e.key === 'f' ) {
                searchRef.current.focus() //adiciona focus ao input de referencia
                e.preventDefault()
            }
        } )
    }, [] )

    //quando os filtros forem alterados irá fazer um novo pedido dos dados no DB
    useEffect( () => {
        toggleLoad()
        setScrollEndingAt( 24 )
        //getDatabaseData()
    }, [ filters ] )

    //quando for alterado o campo de busca, o sistema mostrará os dados correspondentes
    //se a busca for valida, irá filtrar localmente os dados
    useEffect( () => {
        if ( !salvandoClientes ) setScrollEndingAt( 24 )
        if ( salvandoClientes ) setSalvandoClientes( false )
        if ( busca !== '' ) setClientesFiltrados( filtrarClientesPorBusca() )
        if ( busca === '' ) setClientesFiltrados( clientes )
    }, [ busca, clientes ] )

    function toggleLoad () {
        dispatch( { type: 'setLoad', payload: !state.load } )
    }

    async function getDatabaseData () {
        let database = await axios.get( '/api/getimpressoras', { params: { filters } } )
        setClientes( database.data )
        props.setLoad( false )
    }

    function filtrarClientesPorBusca () {

        function limparString ( str ) {
            return str.toLowerCase().normalize( 'NFD' ).replace( /[\u0300-\u036f]/g, '' )
        }

        function compararString ( compare, str ) {
            if ( compare.indexOf( str ) > -1 ) return true
            return false
        }

        const buscaLimpa = limparString( busca )
        return () => {
            let filtrados = {}

            for ( let id in clientes ) {
                let cliente = clientes[ id ]

                if ( compararString( limparString( cliente.nomefantasia ), buscaLimpa )
                    || compararString( limparString( cliente.razaosocial ), buscaLimpa )
                    || compararString( cliente.id, buscaLimpa )
                    || compararString( cliente.cpfcnpj, buscaLimpa )
                    || compararString( cliente.contato.email, buscaLimpa )
                    || compararString( cliente.contato.telefone, buscaLimpa )
                    || compararString( cliente.contato.celular, buscaLimpa )
                    || compararString( limparString( cliente.endereco.rua ), buscaLimpa ) ) {

                    filtrados[ cliente.id ] = cliente
                    continue
                }

                for ( let serial in cliente.impressoras ) {
                    if ( compararString( limparString( serial ), buscaLimpa ) ) {
                        filtrados[ cliente.id ] = cliente
                        continue
                    }
                }
            }
            return filtrados
        }
    }

    function getDatas () {
        let datas = []
        let data = new Date()
        let ano = data.getFullYear()
        let mes = data.getMonth() + 1

        for ( var x = 0; x < 4; x++ ) {
            datas.push( { value: ano + '-' + ( mes < 10 ? `0${ mes }` : mes ), label: ( mes < 10 ? `0${ mes }` : mes ) + '/' + ano } )

            if ( mes <= 1 ) {
                mes = 12
                ano = ano - 1
            } else {
                mes--
            }
        }
        return datas
    }

    function handleScroll ( e ) {
        let bottom = Math.abs( ( e.target.scrollHeight - e.target.scrollTop ) - e.target.clientHeight ) < 150
        let a = scrollEndingAt + 24
        let b = Object.keys( clientesFiltrados ).length

        if ( bottom && a < b ) setScrollEndingAt( a )
        if ( bottom && a > b && a != b ) setScrollEndingAt( b )
    }

    function expandirCliente ( id ) {
        setClienteExpandido( id )
    }

    function fecharExpandido () {
        setClienteExpandido( null )
    }

    async function salvarExpandido ( cliente ) {
        let aviso = props.notificate( 'Aviso', 'Salvando dados, aguarde...', 'info' )

        await axios.post( '/api/salvarcliente', { usuario: state.usuario, cliente } ).then( () => {
            //depois que salvou atualiza os dados localmente
            props.notificate( 'Sucesso', 'Todos os dados foram salvos!', 'success' )
            setClientes( { ...clientes, [ cliente.id ]: cliente } )
        } ).catch( err => {
            console.error( err )
            props.notificate( 'Erro', 'Usuário sem permissão para isso!', 'danger' )
        } )
        props.removeNotification( aviso )
    }

    function renderViews () {
        let views = []

        if ( Object.keys( clientesFiltrados ).length <= 0 ) return views

        for ( let x = 0; x < scrollEndingAt; x++ ) {
            let id = Object.keys( clientesFiltrados )[ x ]
            if ( !id ) break
            views.push( <Resumo key={ id } cliente={ clientesFiltrados[ id ] } { ...{ version: packageInfo.version, expandirCliente } } /> )
        }
        return views
    }

    return (
        <MainFrame>
            <S.Container expanded={ expandido } sempreVisivel={ sempreVisivel }>
                <Header >
                    <DropDown { ...{ filters, setFilters, filterDefaults, busca, setBusca, getDatas, searchRef } } />
                </Header>
                <S.View onScroll={ e => handleScroll( e ) }> { renderViews() } </S.View>
                { clienteExpandido && <Expandido { ...{ ...props, cliente: clientes[ clienteExpandido ], clientes, filters, fecharExpandido, salvarExpandido } } /> }
            </S.Container>
        </MainFrame>

    )
}

export default Impressoras