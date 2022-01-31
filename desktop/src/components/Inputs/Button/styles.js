import styled from 'styled-components'

export const Container = styled.button`
    width: ${ ( { width } ) => width };
    height: ${ ( { height } ) => height };
    min-height: ${ ( { height } ) => height };
    margin: 8px;
    padding: 8px;
    color: ${ ( { theme } ) => theme.colors.buttonTexts };
    outline: none;
    border: none;
    cursor: pointer;
    background: ${ ( { background } ) => background };
    font-size: 14px;
    border-radius: 5px;
    :hover {
        filter: brightness(0.85);
    }
`