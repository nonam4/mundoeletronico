import { useState, useEffect, useRef, useMemo } from 'react'
import { useDados } from '../contexts/DadosContext'
import { useRouter } from 'next/router'

import * as S from '../styles/impressoras'
import * as Notification from '../workers/notification'
import * as Database from '../workers/database'

import MainFrame from '../components/MainFrame'
import Header from '../components/Header'
import DropDown from '../components/Impressoras/DropDown'
import Resumo from '../components/Impressoras/Resumo'

function Impressoras () {
    // variaveis do contexto, disponível em todo o sistema
    const { state, dispatch } = useDados()
    const router = useRouter()
    // variaveis sobre a visibilidade do menu lateral
    const { expandido, sempreVisivel } = state.menu
    // referência do campo de busca para focar automático no ctrl + f
    const buscaRef = useRef( null )
    // filtros de listagem
    const [ filtros, setFiltros ] = useState( { listando: 'todos', data: Database.getDatas()[ 0 ].value, busca: '' } )
    // controle de interfaces na tela
    const [ terminaEm, setTerminaEm ] = useState( 24 )
    // cadastros disponíveis no contexto, 
    const cadastros = state.cadastros[ 'locacao' ]
    // array de cadastros filtrados pelo campo de busca, item local, sem referencia ao contexto
    const [ cadastrosFiltrados, setCadastrosFiltrados ] = useState( undefined )

    // controle do ctrl F, se pressionados com stack não faz nada
    function keyPressedListener ( e ) {
        if ( e.ctrlKey && e.key === 'f' ) {

            // se os inputs ainda não estiverem criados não faz nada
            if ( !buscaRef || !buscaRef.current ) return

            buscaRef.current.focus()
            e.preventDefault()
        }
    }
    const memoizedListener = useMemo( () => keyPressedListener, [] )

    // adiciona ou remove os listeners do ctrl + f
    useEffect( () => {
        if ( !router.query.stack ) return window.addEventListener( 'keydown', memoizedListener )
        window.removeEventListener( 'keydown', memoizedListener )
    }, [ router.query.stack ] )

    // como qualquer alteração precisará mudar os filtros
    //então eles são os controladores de busca no database
    useEffect( () => {
        // solicita os dados ao banco de dados
        solicitarDados()
    }, [ filtros.listando, filtros.data ] )

    useEffect( () => {
        // definir o numero de interfaces na tela de volta para o padrão
        setTerminaEm( 24 )
    }, [ filtros, cadastros ] )

    // se o campo de busca ou os dados dos cadastros mudarem o sistema vai:
    useEffect( () => {
        // se a data dos filtros mudar e o cadastro de impressoras estiver em stack, atualiza a url
        if ( router.query.data !== filtros.data && router.query.stack === 'cadastroimpressoras' ) {
            let paginaAtual = router.pathname.replace( '/', '' )
            router.push( {
                pathname: paginaAtual,
                query: {
                    id: router.query.id,
                    stack: 'cadastroimpressoras',
                    data: filtros.data,
                }
            } )
        }

        // se a busca estiver vazia vai definir os cadastros filtrados com os dados do contexto
        if ( filtros.busca === '' ) return setCadastrosFiltrados( cadastros )

        // se estiver buscando algo vai definir os cadastros baseado na busca
        setCadastrosFiltrados( filtrarCadastrosPorBusca() )
    }, [ filtros.busca, cadastros ] )

    // garante que o load será fechado quando o stack mudar
    // ou quando filtrar tudo certinho
    useEffect( () => {
        if ( cadastrosFiltrados ) setLoad( false )
    }, [ router.query.stack, cadastrosFiltrados ] )

    function setLoad ( valor ) {
        if ( typeof valor !== 'boolean' ) throw new Error( 'Valor para "Load" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setLoad', payload: valor } )
    }

    function setCadastros ( dados ) {
        dispatch( { type: 'setCadastros', payload: dados } )
    }

    function setVersao ( dados ) {
        dispatch( { type: 'setVersao', payload: dados } )
    }

    function solicitarDados () {
        // sempre que for buscar algo no database mostre o load
        setLoad( true )
        // não defina o load depois de receber os dados pois irá filtrar e atualizar os cadastros antes
        Database.getImpressoras( filtros ).then( res => {
            setCadastros( res.data.cadastros )
            setVersao( res.data.versao )
            setDadosSolicitados( true )
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
        function compararString ( compare ) {
            if ( compare.indexOf( buscaLimpa ) > -1 ) return true
            return false
        }

        // faz a busca pelo nome, endereço, id, dados de contato e por serial de máquina
        return () => {
            let filtrados = {}

            for ( let id in cadastros ) {
                let cliente = cadastros[ id ]

                if ( compararString( limparString( cliente.nomefantasia ) )
                    || compararString( limparString( cliente.razaosocial ) )
                    || compararString( cliente.id )
                    || compararString( cliente.cpfcnpj )
                    || compararString( cliente.contato.email )
                    || compararString( cliente.contato.telefone )
                    || compararString( cliente.contato.celular )
                    || compararString( limparString( cliente.endereco.rua ) )
                    || compararString( limparString( cliente.endereco.cidade ) ) ) {

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

    function renderViews () {
        let views = []

        if ( cadastrosFiltrados && Object.keys( cadastrosFiltrados ).length > 0 ) {
            for ( let x = 0; x < terminaEm; x++ ) {
                let id = Object.keys( cadastrosFiltrados )[ x ]
                if ( !id ) break
                views.push( <Resumo key={ id } { ...{ cadastro: cadastrosFiltrados[ id ], filtros, versao: state.versao } } /> )
            }
        }
        return views
    }

    function showView () {
        if ( router.query.stack !== 'cadastroimpressoras' || !router.query.stack ) return true
        return false
    }

    return (
        <MainFrame>
            <S.Container expandido={ expandido } sempreVisivel={ sempreVisivel }>
                <Header >
                    <DropDown { ...{ filtros, setFiltros, buscaRef } } />
                </Header>
                <S.View show={ showView() } onScroll={ e => rolarTela( e ) }> { renderViews() } </S.View>
            </S.Container>
        </MainFrame>

    )
}

export default Impressoras