import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from 'styled-components'
import { useDados } from '../../../contexts/DadosContext'
import { useRouter } from 'next/router'
import set from 'lodash/fp/set'

import * as Database from '../../../workers/database'
import * as Notification from '../../../workers/notification'

import MenuIcon from '../../../components/Icons/MenuIcon'
import * as L from '../Lists'
import * as S from './styles'

function Atendimento ( props ) {
    const { state, dispatch } = useDados()
    const router = useRouter()
    const { colors } = useContext( ThemeContext )
    const [ atendimentosRollback, setAtendimentosRollback ] = useState( [] )
    const [ atendimentos, setAtendimentos ] = useState( [] )
    const [ expandido, setExpandido ] = useState( props.expandido ? props.expandido : false )
    const [ ordenado, setOrdenado ] = useState( false )

    useEffect( () => {
        if ( props.atendimentos ) setAtendimentosRollback( convertToArray( props.atendimentos ) )
    }, [ props.atendimentos ] )

    useEffect( () => {
        setAtendimentos( atendimentosRollback )
    }, [ atendimentosRollback ] )

    useEffect( () => {
        setOrdenado( JSON.stringify( atendimentos ) !== JSON.stringify( atendimentosRollback ) )
    }, [ atendimentos ] )

    function setLoad ( valor ) {
        if ( typeof valor !== 'boolean' ) throw new Error( 'Valor para "Load" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setLoad', payload: valor } )
    }

    function convertToArray ( object ) {
        let newObject = JSON.parse( JSON.stringify( object ) )
        let arr = []

        function compare ( a, b ) {
            if ( a.ordem < b.ordem ) {
                return -1
            }
            if ( a.ordem > b.ordem ) {
                return 1
            }
            return 0
        }

        for ( let key in newObject ) {
            arr.push( newObject[ key ] )
        }

        arr.sort( compare )
        return arr
    }

    function expandirCadastro ( chave ) {
        let paginaAtual = router.pathname.replace( '/', '' )
        setLoad( true )

        setTimeout( () => {
            router.push( {
                pathname: paginaAtual,
                query: {
                    chave, stack: 'cadastroatendimento'
                }
            } )
        }, 200 )
    }

    function diminuirEstoqueSuprimentos ( atendimento ) {

        function setInSuprimentos ( alteracao ) {
            return dispatch( { type: 'setSuprimentos', payload: { ...alteracao } } )
        }

        // se o atendimento não estiver concluído não irá baixar a quantidade
        if ( !atendimento.feito ) return false
        let suprimentosLocal = JSON.parse( JSON.stringify( state.suprimentos ) )

        for ( let index in atendimento.lista ) {

            let resto = suprimentosLocal[ index ].estoque - editado.lista[ index ].quantidade
            suprimentosLocal[ index ].estoque = resto
            if ( resto < 0 ) suprimentosLocal[ index ].estoque = 0
        }
        setInSuprimentos( suprimentosLocal )
        return suprimentosLocal
    }

    function finalizarReabrirCadastro ( atendimento, status ) {

        function setInAtendimentos ( alteracao ) {

            let payload = JSON.parse( JSON.stringify( state.atendimentos ) )
            // primeiro tenha certeza que nenhuma tenha o atendimento
            delete payload[ 'Em aberto' ][ alteracao.chave ]
            delete payload[ 'Feitos' ][ alteracao.chave ]

            // caso o técnico não exista no payload ainda transforma ele em objeto, evita erros
            if ( alteracao.responsavel !== '' && !payload[ 'Tecnicos' ][ alteracao.responsavel ] ) payload[ 'Tecnicos' ][ alteracao.responsavel ] = {}
            if ( alteracao.responsavel !== '' && payload[ 'Tecnicos' ][ alteracao.responsavel ][ alteracao.chave ] ) delete payload[ 'Tecnicos' ][ alteracao.responsavel ][ alteracao.chave ]

            // depois define os dados alterados novamente
            // se estiver feito
            if ( alteracao.feito ) payload = { ...set( `Feitos.${ alteracao.chave }`, alteracao, payload ) }

            // se o responsável for em branco - em aberto
            if ( !alteracao.feito && alteracao.responsavel === '' ) payload = { ...set( `Em aberto.${ alteracao.chave }`, alteracao, payload ) }


            // caso tenha algum responsável informado
            if ( !alteracao.feito && alteracao.responsavel !== '' ) payload = { ...set( `Tecnicos.${ alteracao.responsavel }.${ alteracao.chave }`, alteracao, payload ) }

            return dispatch( { type: 'setAtendimentos', payload } )
        }

        const data = new Date()
        const timestamp = { _seconds: data.getTime() / 1000, _nanoseconds: data.getTime() }

        let aviso = Notification.notificate( 'Aviso', 'Salvando dados, aguarde...', 'info' )
        let finalizado = { ...atendimento, feito: !status, dados: { ...atendimento.dados, ultimaalteracao: timestamp } }
        Database.salvarAtendimento( state.usuario, finalizado, diminuirEstoqueSuprimentos( finalizado ) ).then( () => {
            Notification.removeNotification( aviso )
            Notification.notificate( 'Sucesso', 'Todos os dados foram salvos!', 'success' )
            // depois que salvou atualiza os dados localmente
            setInAtendimentos( finalizado )
        } ).catch( err => {
            Notification.removeNotification( aviso )
            console.error( err )
            Notification.notificate( 'Erro', 'Tivemos um problema, tente novamente!', 'danger' )
        } )
    }

    function handleOnDragEnd ( result ) {
        const { destination, source } = result
        const atendimentosOrdenados = Array.from( JSON.parse( JSON.stringify( atendimentos ) ) )

        // se o item for soltado fora da área correta então ignora
        if ( !destination ) return
        // se o item for soltado no mesmo lugar que ele estava então ignora
        if ( destination.droppableId === source.droppableId &&
            destination.index == source.index ) return

        // primeiro remove da lista o item que foi mexido
        atendimentosOrdenados.splice( source.index, 1 )
        // depois readiciona ele no novo index
        atendimentosOrdenados.splice( destination.index, 0, atendimentos[ source.index ] )
        setAtendimentos( atendimentosOrdenados )
    }

    function rollbackOrders () {
        setAtendimentos( atendimentosRollback )
    }

    function salvarOrdem () {

        function setInAtendimentos ( alteracoes ) {

            let payload = JSON.parse( JSON.stringify( state.atendimentos ) )

            for ( let chave in alteracoes ) {
                let alteracao = alteracoes[ chave ]
                payload[ 'Tecnicos' ][ alteracao.responsavel ][ chave ] = alteracao
            }

            return dispatch( { type: 'setAtendimentos', payload } )
        }

        let object = {}
        atendimentos.forEach( ( atendimento, index ) => {
            atendimento.ordem = index + 1

            object[ atendimento.chave ] = atendimento
        } )

        // notifica a gravação da ordem dos atendimentos
        let aviso = Notification.notificate( 'Aviso', 'Salvando dados, aguarde...', 'info' )
        Database.salvarOrdemAtendimentos( state.usuario, object ).then( () => {
            Notification.removeNotification( aviso )
            Notification.notificate( 'Sucesso', 'Todos os dados foram salvos!', 'success' )
            // depois que salvou atualiza os dados localmente
            setInAtendimentos( object )
        } ).catch( err => {
            Notification.removeNotification( aviso )
            console.error( err )
            Notification.notificate( 'Erro', 'Tivemos um problema, tente novamente!', 'danger' )
        } )
    }

    let customProps = { expandido, atendimentos, expandirCadastro, finalizarReabrirCadastro }
    if ( atendimentos.length > 0 || props.tecnico === 'Em aberto' || props.tecnico === 'Feitos' ) return (
        <S.Container>
            <S.Header>
                <S.HeaderName>{ props.tecnico }</S.HeaderName>
                <S.HeaderButtons>
                    { ordenado && <>
                        <S.Button onClick={ rollbackOrders } hover={ colors.azul } title={ 'Desfazer' }> <MenuIcon name='desfazer' margin='0.5' /> </S.Button>
                        <S.Button onClick={ salvarOrdem } hover={ colors.azul } title={ 'Salvar' }> <MenuIcon name='salvar' margin='0.5' /> </S.Button>
                    </> }
                    <S.Button onClick={ () => setExpandido( !expandido ) } hover={ colors.azul } title={ expandido ? 'Recolher' : 'Expandir' }>
                        <MenuIcon name={ expandido ? 'arrow_up' : 'arrow_dwn' } margin='0' />
                    </S.Button>
                </S.HeaderButtons>
            </S.Header>
            { props.draggable ? <L.DragNDrop { ...{ ...props, handleOnDragEnd, ...customProps } } />
                : <L.Simple { ...{ ...props, ...customProps } } /> }
        </S.Container>
    )
    return ( <></> )
}
export default Atendimento