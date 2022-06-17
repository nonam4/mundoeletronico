import React, { useEffect, useState } from 'react'
import { Dimensions } from 'react-native'

import * as S from './styles'

function Load ( props ) {

    const windowWidth = Dimensions.get( 'window' )

    const [ opacity, setOpacity ] = useState( 1 )
    const [ zindex, setZindex ] = useState( 99 )

    useEffect( () => {
        props.show ? setOpacity( 1 ) : setTimeout( () => { setOpacity( 0 ) }, 500 )
        props.show ? setZindex( 99 ) : setTimeout( () => { setZindex( -1 ) }, 500 )
    }, [ props.show ] )

    return (
        <S.Container elevation={ zindex } opacity={ opacity } zindex={ zindex }>
            <S.Logo size={ windowWidth.width * 0.6 } resizeMode={ 'center' } source={ require( '../../images/icon.png' ) } />
            <S.Loader size='large' />
        </S.Container>
    )
}

export default Load