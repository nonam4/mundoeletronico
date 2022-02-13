import { useEffect, useState } from 'react'

import * as S from './styles'

function Load ( props ) {
    const [ opacity, setOpacity ] = useState( '1' )
    const [ zindex, setZindex ] = useState( '99' )

    useEffect( () => {
        if ( props.show && document.activeElement ) document.activeElement.blur()

        props.show ? setOpacity( '1' ) : setTimeout( () => { setOpacity( '0' ) }, 500 )
        props.show ? setZindex( '99' ) : setTimeout( () => { setZindex( '-1' ) }, 500 )
    }, [ props.show ] )

    return (
        <S.Container opacity={ opacity } zindex={ zindex }>
            <S.Logo src='./icon.png' />
            <S.Loader>
                <S.Circle viewBox='25 25 50 50'>
                    <S.Spinner cx='50' cy='50' r='20' fill='none' strokeWidth='3' strokeMiterlimit='10' />
                </S.Circle>
            </S.Loader>
        </S.Container>
    )
}

export default Load