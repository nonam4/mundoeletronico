import styled from 'styled-components/native'

export const Container = styled.View`
    width: 100%;
    height: 100%;
    flex: 1;
    align-items: center;
    justify-content: center;
    background: ${ ( { theme } ) => theme.colors.background };
`

export const Text = styled.Text`
    font-size: 14px;
    color: ${ ( { theme } ) => theme.colors.texts };
`;