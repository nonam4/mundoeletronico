import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from 'styled-components'
import { useDados } from '../../../contexts/DadosContext'
import { useRouter } from 'next/router'

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

    function setInAtendimentos ( alteracoes ) {

        let payload = JSON.parse( JSON.stringify( state.atendimentos ) )

        for ( let chave in alteracoes ) {
            let alteracao = alteracoes[ chave ]
            payload[ 'Tecnicos' ][ alteracao.responsavel ][ chave ] = alteracao
        }

        return dispatch( { type: 'setAtendimentos', payload } )
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

    function finalizarReabrirCadastro ( chave ) {
        console.log( `atendimento ${ chave } finalizado` )
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