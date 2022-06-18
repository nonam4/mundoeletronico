import React, { useState, useEffect } from 'react'
import Animated, { withTiming, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'

import * as S from './styles'

function TextField ( props ) {
    const settings = {
        type: 'none',
        icon: 'undefined',
        maxLength: 23
    }

    const [ shown, setShown ] = useState( false )
    const [ type, setType ] = useState( props.type || settings.type )

    const highlight = useSharedValue( { width: 0, left: 50 } )
    const config = { duration: 250 }
    const style = useAnimatedStyle( () => {
        return {
            width: withTiming( `${ highlight.value.width }%`, config ),
            left: withTiming( `${ highlight.value.left }%`, config )
        }
    } )

    function handleType () {
        if ( props.type === 'password' && !shown ) return setType( 'password' )
        return setType( settings.type )
    }

    useEffect( () => {
        handleType()
    }, [ shown ] )

    function onFocus ( callback ) {

        highlight.value = { width: 100, left: 0 }
        if ( callback ) callback()
    }

    function onBlur ( callback ) {
        highlight.value = { width: 0, left: 50 }
        if ( callback ) callback()
    }

    return (
        <S.Container>
            <S.Input ref={ props.useRef } onFocus={ () => onFocus( props.onFocus ) } onBlur={ () => onBlur( props.onBlur ) } textContentType={ type } icon={ props.icon } onChangeText={ props.onChangeText } value={ props.value } maxLength={ props.maxLength || settings.maxLength } placeholder={ ' ' } />
            <S.Content>
                <S.Highlight as={ Animated.View } style={ [ style ] } />
            </S.Content>
        </S.Container >
    )
}

export default TextField