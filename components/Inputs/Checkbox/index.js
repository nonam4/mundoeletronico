import { useState, useEffect } from 'react'
import { Container, Input, Label } from './styles'

function Checkbox(props) {
    const [checked, setChecked] = useState(false)
    const settings = {
        text: 'Clique aqui...',
        width: '250px',
        height: '22px',
    }

    useEffect(() => {
        if (props.checked) return setChecked(true)
        return setChecked(false)
    }, [props.checked])

    function handleChecked() {
        setChecked(!checked)
        props.changeReturn()
    }

    return (
        <Container width={props.width || settings.width} height={props.height || settings.height} checked={props.checked}>
            <Input checked={checked} onChange={handleChecked}/>
            <Label  onClick={handleChecked}> {props.text || settings.text} </Label>
        </Container>
    )
}

export default Checkbox