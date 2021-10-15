import styled from "styled-components"

export const Container = styled.div`
    width: 100%;
    height: 100%;
    margin-left: ${({ expanded, desktop }) => desktop? '0px' : expanded? '-250px' : '0px'};
    position: relative;
`
export const View = styled.div`
    width: 100%;
    height: fit-content;
    max-height: calc(100% - 60px);
    overflow: hidden;
    overflow-y: auto;
    padding: 0.8rem 0 0 0.8rem;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    ::-webkit-scrollbar {
        width: 1.1rem;
        background: ${({ theme }) => theme.colors.background};
    }
    ::-webkit-scrollbar-thumb {
        border-radius: 8px;
        background: ${({ theme }) => theme.colors.highlight};
        border: 0.3rem solid ${({ theme }) => theme.colors.background};
        background-clip: padding-box;
    }
`
export const Botoes = styled.div`
    width: 100%;
    display: flex;
    padding-right: 0.8rem;
    justify-content: flex-end;
`
export const Botao = styled.button`
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
export const TituloContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-right: 0.8rem;
    @media only screen and (max-width: 600px) {
        display: block;
    }
`
export const Titulo = styled.div`
    font-size: 24px;
    text-transform: uppercase;
    line-height: 48px;
`
export const LinhaContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-right: 0.8rem;

    @media only screen and (max-width: 600px) {
        display: block;
    }
`
export const LinhaSubContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
`
export const Linha = styled.div`
    width: 100%;
    display: flex;
    min-width: ${({ minWidth}) => minWidth? `${minWidth}` : '0px'};
    max-width: ${({ maxWidth}) => maxWidth? `${maxWidth}` : 'unset'};
    margin-bottom: ${({ margin }) => margin? margin : '0.4rem'};

    @media only screen and (max-width: 600px) {
        min-width: ${({ important, minWidth }) => important? `${minWidth}` : 'unset'};
        max-width: ${({ important, maxWidth }) => important? `${maxWidth}` : 'unset'};
        width: 100%;
    }
`
export const SubLinha = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    @media only screen and (max-width: 600px) {
        display: block;
    }
`
export const Spacer = styled.div`
    min-width: 0.8rem;
    max-width: 0.8rem;
`
export const DadosColetor = styled.div`
    width: 100%;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.floating};
`
export const Listagem = styled.div`
    width: 100%;
    height: fit-content;
    max-height: 100%;
    overflow: hidden;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    ::-webkit-scrollbar {
        width: 1.1rem;
        background: ${({ theme }) => theme.colors.background};
    }
    ::-webkit-scrollbar-thumb {
        border-radius: 8px;
        background: ${({ theme }) => theme.colors.highlight};
        border: 0.3rem solid ${({ theme }) => theme.colors.background};
        background-clip: padding-box;
    }
`
export const HorarioContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding-right: 0.8rem;
`
export const HorarioSubcontainer = styled.div`
    width: 100%;
    
    div {
        width: 100%;
        margin: 0;
        padding: 0;
    }
`
export const Horario = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;

    svg {
        width: 16px;
        height: 16px;
    }
`