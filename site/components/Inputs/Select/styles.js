import styled from 'styled-components'

export const Container = styled.div`
    position: relative;
`
export const Content = styled.select`
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: ${ ( { theme } ) => theme.colors.texts };
    cursor: pointer;
    padding: 0.5rem;
    transition: all linear 0.05s;
`
export const Option = styled.option`
    color: ${ ( { theme } ) => theme.colors.texts };
    background: ${ ( { theme } ) => theme.colors.menus };
`
export const Highlight = styled.span`
    width: 0px;
    position: absolute;
    bottom: 0;
    left: 50%;
    border-bottom: solid 2px ${ ( { theme } ) => theme.colors.hover };
`