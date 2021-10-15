import styled from "styled-components"

export const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin: 0 0.3rem 0.8rem 0;
    cursor: default;
`
export const Header = styled.div`
    width: 100%;
    display: flex;
`
export const HeaderName = styled.div`
    width: 100%;
    font-size: 22px;
    color: ${({ theme }) => theme.colors.texts};
`
export const HeaderButtons = styled.div`
    display: flex;
`
export const Button = styled.button`
    width: fit-content;
    height: fit-content;
    background: none;
    margin: 0;
    border: none;
    padding: 0;
    cursor: pointer;
    outline: none;
    padding: 4px;
    :hover{
        path {
            fill: ${({ hover }) => hover};
        }
    }
`