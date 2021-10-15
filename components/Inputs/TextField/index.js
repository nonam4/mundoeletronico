import { useEffect, useState } from 'react'

import Icon from '../../Icons/MenuIcon'
import * as S from './styles'

function TextField(props) {
    const settings = {
        type: 'text',
        placeholder: 'Digite aqui...',
        icon: 'undefined',
        maxLength: 23,
    }
    const [shown, setShown] = useState(false)
    const [type, setType] = useState(props.type || settings.type)

    function handleType() {
        props.type === 'password'? shown? setType('text') : setType('password') : setType('text')
    }

    useEffect(() => {
        handleType()
    }, [shown])

    return (
        <S.Container>
            <S.Input ref={props.useRef} onFocus={props.onFocus} onBlur={props.onBlur} type={type} icon={props.icon} onChange={props.onChange} value={props.value} maxLength={props.maxLength || settings.maxLength} placeholder={' '}/>
            <S.Content> 
                {props.icon !== false && <Icon name={props.icon || settings.icon} /> }
                <S.Label icon={props.icon}> {props.placeholder || settings.placeholder} </S.Label>
                <S.Highlight />
            </S.Content>
            {props.type === 'password' && <S.Viewer onClick={() => setShown(!shown)}> <Icon size={20} name={shown? 'senha_esconder': 'senha_mostrar'} /> </S.Viewer>}
        </S.Container>
    )
}

export default TextField