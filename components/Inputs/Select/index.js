import * as S from './styles'

function Select(props) {
    const settings = {
        options: '<option value="undefined">Não definido</option>',
    }

    return (
        <S.Container>
            <S.Content defaultValue={props.default} value={props.valor} onChange={props.onChange}> 
                {props.options.map(option => <S.Option key={option.value} value={option.value}>{option.label}</S.Option>) || settings.options}
            </S.Content>
            <S.Highlight />
        </S.Container>
    )
}

export default Select
