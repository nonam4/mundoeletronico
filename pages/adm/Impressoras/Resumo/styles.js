import styled from "styled-components"

export const Container = styled.div`
    width: calc(25% - 0.8rem);
    min-width: 300px;
    display: flex;
    flex-direction: column;
    background: ${({ theme }) => theme.colors.menus};
    border-radius: 5px;
    border: solid 1px ${({ theme }) => theme.colors.borders};
    padding: 0.8rem;
    margin: 0 0.8rem 0.8rem 0;
    cursor: pointer;
    box-shadow: 0px 0px 10px -8px black;
    :hover{
        border-color: ${({ hoverColor }) => hoverColor};
    }
    @media only screen and (max-width: 1679px) {
        width: calc(33.33% - 0.8rem);
    }
    @media only screen and (max-width: 1213px) {
        width: calc(50% - 0.8rem);
    }
    @media only screen and (max-width: 905px) {
        min-width: calc(100% - 0.8rem);
    }
    @media only screen and (max-width: 833px) {
        min-width: calc(50% - 0.8rem);
    }
    @media only screen and (max-width: 650px) {
        min-width: calc(100% - 0.8rem);
    }
`
export const Header = styled.div`
    width: 100%;
    display: flex;
`
export const NomeContainer = styled.div`
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`
export const Nome = styled.h2`
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`
export const Subnome = styled.div`
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`
export const IconContainer = styled.div`
    padding-left: 0.8rem;
    margin-right: -0.8rem;
`
export const Line = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0.8rem 0 0 0;
`
export const LineItem = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`
export const LineTitle = styled.div`
    width: 100%;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.floating};
`
export const LineText = styled.div`
    width: 100%;
    font-size: 18px;
`
export const LineSubtext = styled.div`
    width: 100%;
    font-size: 14px;
`