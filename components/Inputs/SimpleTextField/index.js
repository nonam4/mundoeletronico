import * as S from './styles'

function Select ( props ) {
    const settings = {
        placeholder: 'Digite aqui...',
        maxLength: 23,
    }

    return (
        <S.Container>
            <S.Content value={ props.value } onChange={ props.onChange } placeholder={ props.placeholder || settings.placeholder } maxLength={ props.maxLength || settings.maxLength } onFocus={ props.onFocus } onBlur={ props.onBlur } />
            <S.Highlight />
        </S.Container>
    )
}

export default Select
