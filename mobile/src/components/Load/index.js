import React, { useEffect, useState } from 'react'
import { Dimensions, Animated } from 'react-native'

import * as S from './styles'

function Load ( props ) {

    const windowWidth = Dimensions.get( 'window' )
    const opacity = useState( new Animated.Value( 0 ) )[ 0 ]
    const [ zindex, setZindex ] = useState( 99 )

    useEffect( () => {
        props.show ? setZindex( 99 ) : setTimeout( () => { setZindex( -1 ) }, 250 )
        showHide()
    }, [ props.show ] )

    function showHide () {
        Animated.timing( opacity, {
            toValue: props.show ? 1 : 0,
            duration: 250,
            useNativeDriver: true
        } ).start()
    }

    return (
        <S.Container elevation={ zindex } zIndex={ zindex }>
            <Animated.View style={ [ { opacity } ] }>
                <S.Logo size={ windowWidth.width * 0.6 } resizeMode={ 'center' } source={ require( '../../images/icon.png' ) } />
                <S.Loader size='large' />
            </Animated.View>
        </S.Container >
    )
}

export default Load