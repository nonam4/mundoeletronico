import React, { useState, useEffect, useContext } from 'react'
import Animated, { withTiming, useAnimatedStyle, useSharedValue, color } from 'react-native-reanimated'
import { ThemeContext } from 'styled-components'

import Icon from '../../Icons/MenuIcon'
import * as Sizes from '../../../workers/sizes'
import * as S from './styles'

function TextField ( props ) {
    const settings = {
        type: 'none',
        icon: 'undefined',
        placeholder: 'Digite aqui...',
        maxLength: 21
    }

    const { colors } = useContext( ThemeContext )
    const [ shown, setShown ] = useState( false )
    const [ type, setType ] = useState( props.type || settings.type )
    const [ text, setText ] = useState( '' )
    // duração das animações
    const config = { duration: 250 }

    const highlight = useSharedValue( { width: 0, left: 50 } )
    const highlightStyle = useAnimatedStyle( () => {
        return {
            width: withTiming( `${ highlight.value.width }%`, config ),
            left: withTiming( `${ highlight.value.left }%`, config )
        }
    } )

    const label = useSharedValue( { top: 30, fontSize: 16, color: colors.texts } )
    const labelStyle = useAnimatedStyle( () => {
        return {
            top: withTiming( `${ label.value.top }%`, config ),
            fontSize: withTiming( label.value.fontSize, config ),
            color: withTiming( label.value.color, config )
        }
    } )

    function handleType () {
        if ( props.type === 'password' && !shown ) return setType( 'password' )
        return setType( settings.type )
    }

    useEffect( () => {
        if ( text.length > 0 ) label.value = { top: 2, fontSize: 12, color: colors.hover }
    }, [] )

    useEffect( () => {
        handleType()
    }, [ shown ] )

    function onFocus ( callback ) {
        highlight.value = { width: 100, left: 0 }
        label.value = { top: 2, fontSize: 13, color: colors.hover }
        if ( callback ) callback()
    }

    function onBlur ( callback ) {
        if ( text.length === 0 ) {
            label.value = { top: 40, fontSize: 14, color: colors.texts }
            highlight.value = { width: 0, left: 50 }
        }
        if ( callback ) callback()
    }

    function onChangeText ( text, callback ) {
        setText( text )
        if ( callback ) callback()
    }

    return (
        <S.Container>
            <S.Content>
                { props.icon !== false && <Icon name={ props.icon || settings.icon } /> }
                <S.Label as={ Animated.Text } style={ [ labelStyle ] }>{ props.placeholder || settings.placeholder }</S.Label>
            </S.Content>
            <S.Highlight as={ Animated.View } style={ [ highlightStyle ] } />
            <S.Input ref={ props.useRef } onFocus={ () => onFocus( props.onFocus ) } onBlur={ () => onBlur( props.onBlur ) } textContentType={ type } icon={ props.icon } onChangeText={ e => onChangeText( e, props.onChangeText ) } value={ props.value } maxLength={ props.maxLength || settings.maxLength } placeholder={ ' ' } />
            { props.type === 'password' && <S.Viewer underlayColor={ colors.background } onPress={ () => setShown( !shown ) }>
                <Icon name={ shown ? 'senha_esconder' : 'senha_mostrar' } />
            </S.Viewer> }
        </S.Container >
    )
}

export default TextField