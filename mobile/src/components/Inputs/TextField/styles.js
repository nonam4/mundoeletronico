import styled from 'styled-components/native'

export const Container = styled.View`
    width: 100%;
    height: 50px;
    position: relative;
`
export const Input = styled.TextInput`
    width: 100%;
    height: 100%;
    color: ${ ( { theme } ) => theme.colors.texts };
    font-size: 14px;
    border-bottom-width: 1px;
    border-bottom-color: ${ ( { theme } ) => theme.colors.borders };
    padding: ${ ( { icon } ) => icon !== false ? '22px 39px 8px 44px' : '22px 8px 8px 8px' };
`;
export const Content = styled.View`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    pointer-events: none !important;
`
export const Highlight = styled.View`
    height: 0px;
    position: absolute;
    bottom: 0;
    border-bottom-width: 2px;
    border-bottom-color: ${ ( { theme } ) => theme.colors.hover };
`