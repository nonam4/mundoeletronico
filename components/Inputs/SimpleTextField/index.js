import * as S from './styles'

function Select ( props ) {
    return (
        <S.Container>
            <S.Content value={ props.value } onChange={ props.onChange } placeholder={ 'Digite aqui..' } maxLength={ props.maxLength } onFocus={ props.onFocus } onBlur={ props.onBlur } />
            <S.Highlight />
        </S.Container>
    )
}

export default Select
