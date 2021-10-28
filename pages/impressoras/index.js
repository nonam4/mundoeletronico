import { useState, useEffect, useRef } from 'react'
import { useDados } from '../../contexts/DadosContext'
import axios from 'axios'
import packageInfo from '../../package.json'

import * as S from './styles'

import * as Notification from '../../workers/notification'
import * as Database from '../../workers/database'

import MainFrame from '../../components/MainFrame'
import Header from '../../components/Header'
import DropDown from '../../components/Impressoras/DropDown'
import Resumo from '../../components/Impressoras/Resumo'

function Impressoras () {
    // variaveis do contexto, disponível em todo o sistema
    const { state, dispatch } = useDados()
    // variaveis sobre a visibilidade do menu lateral
    const { expandido, sempreVisivel } = state.menu
    // referência do campo de busca para focar automático no ctrl + f
    const buscaRef = useRef( null )
    // filtros de listagem
    const [ filtros, setFiltros ] = useState( { listando: 'todos', data: Database.getDatas()[ 0 ].value, busca: '' } )
    // controle de interfaces na tela
    const [ terminaEm, setTerminaEm ] = useState( 24 )
    // cadastros disponíveis no contexto, 
    const { cadastros } = state
    // array de cadastros filtrados pelo campo de busca, item loca, não interfere no contexto
    const [ cadastrosFiltrados, setCadastrosFiltrados ] = useState( {} )

    useEffect( () => {
        // adiciona os listeners do ctrl + f
        window.addEventListener( 'keydown', e => {
            // se os inputs ainda não estiverem criados não faz nada
            if ( !buscaRef || !buscaRef.current ) return
            // adiciona focus ao input de busca
            if ( e.ctrlKey && e.key === 'f' ) {
                buscaRef.current.focus()
                e.preventDefault()
            }
        } )
    }, [] )

    // como qualquer alteração precisa mudar os filtros então eles são os controladores de busca no database
    useEffect( () => {
        // define que só mostrarão 24 resultados a não ser que o usuário role a tela
        setTerminaEm( 24 )
        // solicita os dados ao banco de dados
        solicitarDados()
    }, [ filtros.listando, filtros.data ] )

    useEffect( () => {
        dispatch( { type: 'setFiltros', payload: filtros } )
    }, [ filtros ] )

    // se o campo de busca ou os dados dos cadastros mudarem o sistema vai:
    useEffect( () => {
        // definir o numero de interfaces na tela de volta para o padrão
        setTerminaEm( 24 )

        // se a busca estiver vazia vai definir os cadastros filtrados com os dados do contexto
        if ( filtros.busca === '' ) return setCadastrosFiltrados( cadastros )

        // se estiver buscando algo vai definir os cadastros baseado na busca
        setCadastrosFiltrados( filtrarCadastrosPorBusca() )
    }, [ filtros.busca, cadastros ] )

    function setLoad ( valor ) {
        if ( typeof valor !== 'boolean' ) throw new Error( 'Valor para "Load" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setLoad', payload: valor } )
    }

    function setCadastros ( dados ) {
        dispatch( { type: 'setCadastros', payload: dados } )
    }

    function solicitarDados () {
        // sempre que for buscar algo no database mostre o load
        setLoad( true )
        // não defina o load depois de receber os dados pois irá filtrar e atualizar os cadastros antes
        Database.getImpressoras( filtros ).then( res => {
            setCadastros( res.data )
            // última coisa é esconder o load, com um timeout para dar tempo de atualizar tudo certinho
            setTimeout( () => {
                setLoad( false )
            }, 200 )
        } ).catch( err => {
            setLoad( false )
            Notification.notificate( 'Erro', 'Recarregue a página e tente novamente!', 'danger' )
            console.error( err )
        } )
    }

    function filtrarCadastrosPorBusca () {
        const buscaLimpa = limparString( filtros.busca )

        // remove caractéres especiais, pontos, virgulas, etc
        function limparString ( str ) {
            return str.toLowerCase().normalize( 'NFD' ).replace( /[\u0300-\u036f]/g, '' )
        }

        // compara se a entrada tem alguma informação da busca
        function compararString ( compare, str ) {
            if ( compare.indexOf( str ) > -1 ) return true
            return false
        }

        // faz a busca pelo nome, endereço, id, dados de contato e por serial de máquina
        return () => {
            let filtrados = {}

            for ( let id in cadastros ) {
                let cliente = cadastros[ id ]

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

    function rolarTela ( e ) {
        let final = Math.abs( ( e.target.scrollHeight - e.target.scrollTop ) - e.target.clientHeight ) < 150
        let a = terminaEm + 24
        let b = Object.keys( cadastrosFiltrados ).length

        // se o numero de interfaces for maior que o limite define o limite mesmo
        if ( final && a < b ) setTerminaEm( a )

        // se o numero de interfaces for o mesmo ou menor que o limite, define o limite como as interfaces
        if ( final && a > b && a != b ) setTerminaEm( b )
    }

    async function salvarExpandido ( cliente ) {
        let aviso = props.notificate( 'Aviso', 'Salvando dados, aguarde...', 'info' )

        await axios.post( '/api/salvarcliente', { usuario: state.usuario, cliente } ).then( () => {
            //depois que salvou atualiza os dados localmente
            props.notificate( 'Sucesso', 'Todos os dados foram salvos!', 'success' )
            setCadastros( { ...cadastros, [ cliente.id ]: cliente } )
        } ).catch( err => {
            console.error( err )
            props.notificate( 'Erro', 'Usuário sem permissão para isso!', 'danger' )
        } )
        props.removeNotification( aviso )
    }

    function renderViews () {
        let views = []

        if ( Object.keys( cadastrosFiltrados ).length <= 0 ) return views

        for ( let x = 0; x < terminaEm; x++ ) {
            let id = Object.keys( cadastrosFiltrados )[ x ]
            if ( !id ) break
            views.push( <Resumo key={ id } cadastro={ cadastrosFiltrados[ id ] } { ...{ version: packageInfo.version } } /> )
        }
        return views
    }

    return (
        <MainFrame>
            <S.Container expanded={ expandido } sempreVisivel={ sempreVisivel }>
                <Header >
                    <DropDown { ...{ filtros, setFiltros, buscaRef } } />
                </Header>
                <S.View onScroll={ e => rolarTela( e ) }> { renderViews() } </S.View>
                {/* clienteExpandido && <Expandido { ...{ cliente: cadastros[ clienteExpandido ], cadastros, filtros, fecharExpandido, salvarExpandido } } /> */ }
            </S.Container>
        </MainFrame>

    )
}

export default Impressoras