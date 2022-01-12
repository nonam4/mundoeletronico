import styled from 'styled-components'

export const Container = styled.div`
    position: relative;
`
export const Content = styled.input`
    width: 100%;
    padding: 0 0 0.3rem;
    border: none;
    text-align: center;
    outline: none;
    background: transparent;
    color: ${ ( { theme } ) => theme.colors.texts };
    transition: all linear 0.05s;
    font-weight: bold;

    :hover, :focus, :not(:placeholder-shown){
        + span {
            left: 0;
            width: 100%; 
        }
    }
`
export const Highlight = styled.span`
    width: 0px;
    position: absolute;
    bottom: 0;
    left: 50%;
    border-bottom: solid 2px ${ ( { theme } ) => theme.colors.hover };
`