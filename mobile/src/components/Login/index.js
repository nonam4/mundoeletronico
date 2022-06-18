import React from 'react'
import { Dimensions } from 'react-native'

import * as S from './styles'

import TextField from '../Inputs/TextField/index'

function Login () {
    const windowWidth = Dimensions.get( 'window' )

    return (
        <S.Container>
            <S.Logo size={ windowWidth.width * 0.6 } resizeMode={ 'center' } source={ require( '../../images/icon.png' ) } />
            <S.Content>
                <TextField />
            </S.Content>
        </S.Container>
    )
}

export default Login