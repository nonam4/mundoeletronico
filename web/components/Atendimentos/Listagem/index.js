import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from 'styled-components'
import { useDados } from '../../../contexts/DadosContext'
import { useRouter } from 'next/router'

import * as Database from '../../../workers/database'

import MenuIcon from '../../../components/Icons/MenuIcon'
import * as L from '../Lists'
import * as S from './styles'

function Atendimento ( props ) {
    const { dispatch } = useDados()
    const router = useRouter()
    const { colors } = useContext( ThemeContext )
    const [ atendimentos, setAtendimentos ] = useState( {} )
    const [ expandido, setExpandido ] = useState( props.expandido ? props.expandido : false )
    const [ ordenado, setOrdenado ] = useState( false )

    useEffect( () => {
        props.atendimentos && setAtendimentos( JSON.parse( JSON.stringify( props.atendimentos ) ) )
    }, [ props.atendimentos ] )

    useEffect( () => {
        console.log( 'ordenados -> ', atendimentos )
    }, [ atendimentos ] )

    function setLoad ( valor ) {
        if ( typeof valor !== 'boolean' ) throw new Error( 'Valor para "Load" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setLoad', payload: valor } )
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
        const { destination } = result
        if ( !destination ) return


        let source = Object.keys( atendimentos )[ result.source.index ]
        let ordered = {}

        Object.keys( atendimentos ).forEach( ( key, index ) => {

            if ( key === source ) return

            //se o destino for maior que a origem - adiciona os outros elementos antes
            if ( source.index < destination.index ) ordered[ key ] = atendimentos[ key ]


            if ( destination.index === index ) ordered[ source ] = atendimentos[ source ]


            //se o destino for menor que a origem - adiciona os outros elementos depois
            if ( source.index > destination.index ) ordered[ key ] = atendimentos[ key ]
        } )

        //se o usuario apenas mexer um item sem tirar de posição, esse return evita que o sistema limpe totalmente a lista
        if ( Object.keys( ordered ).length <= 0 ) return
        setOrdenado( true )

        setAtendimentos( JSON.parse( JSON.stringify( ordered ) ) )
    }

    function rollbackOrders () {
        setAtendimentos( JSON.parse( JSON.stringify( props.atendimentos ) ) )
        setOrdenado( false )
    }

    function salvarOrdem () {
        console.log( 'ordenados -> ', atendimentos )
        //Database.salvarOrdemAtendimentos( atendimentos )
    }

    let customProps = { expandido, atendimentos, expandirCadastro, finalizarReabrirCadastro }
    if ( Object.keys( atendimentos ).length > 0 || props.tecnico === 'Em aberto' || props.tecnico === 'Feitos' ) return (
        <S.Container>
            <S.Header>
                <S.HeaderName>{ props.tecnico }</S.HeaderName>
                <S.HeaderButtons>
                    { ordenado && <S.Button onClick={ rollbackOrders } hover={ colors.azul } title={ 'Desfazer' }> <MenuIcon name='desfazer' margin='0.5' /> </S.Button> }
                    { ordenado && <S.Button onClick={ salvarOrdem } hover={ colors.azul } title={ 'Salvar' }> <MenuIcon name='salvar' margin='0.5' /> </S.Button> }
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