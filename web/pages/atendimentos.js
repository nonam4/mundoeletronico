import { useState, useEffect, useRef } from 'react'
import { useDados } from '../contexts/DadosContext'
import { useRouter } from 'next/router'

import * as S from '../styles/atendimentos'
import * as Notification from '../workers/notification'
import * as Database from '../workers/database'

import MainFrame from '../components/MainFrame'
import Header from '../components/Header'
import DropDown from '../components/Atendimentos/DropDown'
import Listagem from '../components/Atendimentos/Listagem'

function Atendimentos () {
    const router = useRouter()
    // variaveis do contexto, disponível em todo o sistema
    const { state, dispatch } = useDados()
    // variaveis disponíveis no contexto
    const { atendimentos, menu, cadastros } = state
    // variaveis sobre a visibilidade do menu lateral
    const { expandido, sempreVisivel } = menu
    // referência do campo de busca para focar automático no ctrl + f
    const buscaRef = useRef( null )
    // busca nos atendimentos
    const [ busca, setBusca ] = useState( '' )
    //  array de atendimentos filtrados pelo campo de busca, item loca, não interfere no contexto
    const [ atendimentosFiltrados, setAtendimentosFiltrados ] = useState( { 'Tecnicos': {} } )

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

        solicitarDados()
    }, [] )

    // garante que o load será fechado quando o stack mudar
    useEffect( () => {
        if ( Object.keys( atendimentosFiltrados[ 'Tecnicos' ] ).length > 0 ||
            state.tecnicos ) setLoad( false )
    }, [ router.query.stack ] )

    // como qualquer alteração precisa mudar os filtros então eles são os controladores de busca no database ou busca local
    useEffect( () => {

        // primeiro busca localmente, se não encontrar nenhuma correspondência então passa para a busca no database
        // busca por nome de cliente, data ou palavra chave
        if ( busca === '' ) return setAtendimentosFiltrados( atendimentos )
        setAtendimentosFiltrados( filtrarAtendimentosPorBusca() )
    }, [ busca, atendimentos ] )

    // garante que o load será escondido somente após filtrar todos os dados
    useEffect( () => {

        if ( Object.keys( atendimentosFiltrados[ 'Tecnicos' ] ).length > 0 ||
            state.tecnicos ) setLoad( false )
    }, [ atendimentosFiltrados ] )

    function setLoad ( valor ) {
        if ( typeof valor !== 'boolean' ) throw new Error( 'Valor para "Load" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setLoad', payload: valor } )
    }

    function setAtendimentos ( dados ) {
        dispatch( { type: 'setAtendimentos', payload: dados } )
    }

    function setCadastros ( dados ) {
        dispatch( { type: 'setCadastros', payload: dados } )
    }

    function setTecnicos ( dados ) {
        dispatch( { type: 'setTecnicos', payload: dados } )
    }

    async function solicitarDados () {

        setLoad( true )
        Database.getAtendimentos( busca ).then( res => {
            setCadastros( res.data.cadastros )
            setAtendimentos( res.data.atendimentos )
            setTecnicos( res.data.tecnicos )
        } ).catch( err => {
            setLoad( false )
            Notification.notificate( 'Erro', 'Recarregue a página e tente novamente!', 'danger' )
            console.error( err )
        } )
    }

    function filtrarAtendimentosPorBusca () {

        function limparString ( str ) {
            return str.toLowerCase().normalize( 'NFD' ).replace( /[\u0300-\u036f]/g, '' )
        }

        function compararString ( compare, str ) {
            if ( compare.indexOf( str ) > -1 ) return true
            return false
        }

        function getCadastro ( id ) {
            let localizado = undefined
            for ( let tipo in cadastros ) {
                if ( cadastros[ tipo ][ id ] ) return localizado = cadastros[ tipo ][ id ]
                continue
            }
            return localizado
        }

        function comparar ( atendimento ) {

            const cadastro = getCadastro( atendimento.cliente.id )
            if ( !cadastro ) return false

            // compara os dados do cliente do atendimento
            if ( compararString( limparString( cadastro.nomefantasia ), filtro )
                || compararString( limparString( cadastro.razaosocial ), filtro )
                || compararString( cadastro.cpfcnpj, filtro )
                || compararString( cadastro.contato.email, filtro )
                || compararString( cadastro.contato.telefone, filtro )
                || compararString( cadastro.contato.celular, filtro ) ) return true

            // comapra os dados do atendimento
            if ( compararString( Database.convertTimestamp( atendimento.dados.ultimaalteracao ), filtro )
                || compararString( Database.convertTimestamp( atendimento.dados.inicio ), filtro ) ) return true
            // se nenhuma opção for verdadeira então retorna falso
            return false
        }

        const filtro = limparString( busca )
        return () => {
            let filtrados = {
                'Em aberto': {},
                'Feitos': {},
                'Tecnicos': {}
            }

            //primeiro filtrar os atendimentos em aberto
            for ( let chave in atendimentos[ 'Em aberto' ] ) {
                let atendimento = atendimentos[ 'Em aberto' ][ chave ]
                if ( comparar( atendimento ) ) filtrados[ 'Em aberto' ] = { ...filtrados[ 'Em aberto' ], [ chave ]: atendimento }
            }

            //depois filtrar os atendimentos feitos
            for ( let chave in atendimentos[ 'Feitos' ] ) {
                let atendimento = atendimentos[ 'Feitos' ][ chave ]
                if ( comparar( atendimento ) ) filtrados[ 'Feitos' ] = { ...filtrados[ 'Feitos' ], [ chave ]: atendimento }
            }

            //depois filtra os dos tecnicos
            for ( let tecnico in atendimentos[ 'Tecnicos' ] ) {
                for ( let chave in atendimentos[ 'Tecnicos' ][ tecnico ] ) {
                    let atendimento = atendimentos[ 'Tecnicos' ][ tecnico ][ chave ]
                    if ( comparar( atendimento ) ) filtrados[ 'Tecnicos' ][ tecnico ] = { ...filtrados[ 'Tecnicos' ][ tecnico ], [ chave ]: atendimento }
                }
            }
            return filtrados
        }
    }

    return (
        <MainFrame>
            <S.Container expandido={ expandido } sempreVisivel={ sempreVisivel }>
                <Header >
                    <DropDown { ...{ busca, setBusca, buscaRef } } />
                </Header>
                <S.View>
                    {//lista primeiro os em aberto
                        <Listagem tecnico={ 'Em aberto' } expandido={ true } atendimentos={ atendimentosFiltrados[ 'Em aberto' ] } /> }

                    { Object.keys( atendimentosFiltrados[ 'Tecnicos' ] ).map( tecnico =>
                        <Listagem key={ tecnico } tecnico={ tecnico } expandido={ true } draggable={ true } atendimentos={ atendimentosFiltrados[ 'Tecnicos' ][ tecnico ] } /> ) }

                    {//por fim lista os feitos
                        <Listagem tecnico={ 'Feitos' } feitos={ true } atendimentos={ atendimentosFiltrados[ 'Feitos' ] } /> }
                </S.View>
            </S.Container>
        </MainFrame>
    )
}

export default Atendimentos