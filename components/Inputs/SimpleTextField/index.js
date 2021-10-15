import { Container, Content, Highlight } from './styles'

function Select(props) {
    return (
        <Container>
            <Content value={props.value} onChange={props.onChange} placeholder={'Digite aqui..'} maxLength={props.maxLength} onFocus={props.onFocus} onBlur={props.onBlur}/>
            <Highlight />
        </Container>
    )
}

export default Select
