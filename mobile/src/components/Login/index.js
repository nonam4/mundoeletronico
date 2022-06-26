import React from 'react'

import * as S from './styles'
import TextField from '../Inputs/TextField/index'

function Login () {

    return (
        <S.Container>
            <S.Logo size={ 60 } marginBottom={ 20 } resizeMode={ 'center' } source={ require( '../../images/icon.png' ) } />
            <S.Content>
                <TextField />
            </S.Content>
        </S.Container>
    )
}

export default Login