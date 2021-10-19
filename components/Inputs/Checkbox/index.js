import { useState, useEffect } from 'react'
import * as S from './styles'

function Checkbox ( props ) {
    const [ checked, setChecked ] = useState( false )
    const settings = {
        text: 'Clique aqui...',
        width: '250px',
        height: '22px',
    }

    useEffect( () => {
        if ( props.checked ) return setChecked( true )
        return setChecked( false )
    }, [ props.checked ] )

    function handleChecked () {
        setChecked( !checked )
        props.changeReturn()
    }

    return (
        <S.Container width={ props.width || settings.width } height={ props.height || settings.height } checked={ props.checked }>
            <S.Input checked={ checked } onChange={ handleChecked } />
            <S.Label onClick={ handleChecked }> { props.text || settings.text } </S.Label>
        </S.Container>
    )
}

export default Checkbox