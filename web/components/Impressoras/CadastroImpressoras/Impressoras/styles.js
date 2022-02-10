import styled from 'styled-components'

export const Container = styled.div`
    width: calc(33.33% - 0.8rem);
    min-width: 300px;
    display: flex;
    flex-direction: column;
    background: ${ ( { theme } ) => theme.colors.menus };
    border-radius: 5px;
    border: solid 1px ${ ( { theme } ) => theme.colors.borders };
    padding: 0 0.8rem 0 0.8rem;
    margin: 0 0.8rem 0.8rem 0;
    box-shadow: 0px 0px 10px -8px black;
    height: 340px;
    overflow: hidden;
    overflow-y: auto;
    ::-webkit-scrollbar {
        width: 0.8rem;
        background: ${ ( { theme } ) => theme.colors.menus };
    }
    ::-webkit-scrollbar-thumb {
        border-radius: 6px;
        background: ${ ( { theme } ) => theme.colors.highlight };
        border: 0.2rem solid rgba(0, 0, 0, 0);
        background-clip: padding-box;
    }
    :hover{
        border-color: ${ ( { hoverColor } ) => hoverColor };
    }
    @media only screen and (max-width: 1568px) {
        min-width: calc(50% - 0.8rem);
    }
    @media only screen and (max-width: 1144px) {
        min-width: calc(100% - 0.8rem);
    }
`
export const Titulo = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: solid 1px ${ ( { theme } ) => theme.colors.borders };
    margin-bottom: 0.8rem;
    font-size: 16px;
    line-height: 3;
`
export const TituloContainer = styled.div`
    height: 48px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
`
export const TituloModelo = styled.div`
    line-height: 16px;
`
export const TituloSerial = styled.div`
    font-size: 12px;
    line-height: 12px;
    color: ${ ( { theme } ) => theme.colors.floating };
`
export const TituloSubcontainer = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    height: 48px;
`
export const DadosContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    opacity: ${ ( { show } ) => show != false ? '1' : '0' };
    z-index: ${ ( { show } ) => show != false ? '0' : '-1' };
    max-height: ${ ( { show } ) => show != false ? '100px' : '0px' };
    margin-bottom: ${ ( { show } ) => show != false ? '0.8rem' : 'none' };
`
export const DadosSubcontainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    white-space: nowrap;
    opacity: ${ ( { show } ) => show != false ? '1' : '0' };
    z-index: ${ ( { show } ) => show != false ? '0' : '-1' };
    max-width: ${ ( { show } ) => show != false ? '100%' : '0px' };
    max-height: ${ ( { show } ) => show != false ? 'fit-content' : '0px' };

    input {
        padding-top: 0;
        padding-bottom: 0.3rem;
    }
    :hover {
        span {
            left: 0;
            width: 100%;
        }
    }
`
export const DadosTitulo = styled.div`
    width: 100%;
    font-size: 12px;
    color: ${ ( { theme } ) => theme.colors.floating };
    padding: 0 0.5rem 0.3rem;
    text-align: center;
    cursor: default;
    white-space: nowrap;
`
export const Dados = styled.div`
    width: 100%;
    font-weight: bold;
    text-align: center;
    padding: 0 0.5rem;
    cursor: default;
    white-space: nowrap;
    select {
        text-align-last: center;
        width: fit-content;
        font-weight: bold;
        padding: 0 0.5rem 0.3rem;
    }
    span {
        display: inline;
        color: ${ ( { theme } ) => theme.colors.verde };
    }
`
export const DadosTrocas = styled.div`
    width: 100%;
    font-weight: bold;
    text-align: center;
    padding: 0 0.5rem;
    cursor: pointer;
    position: relative;
    padding-bottom: 0.3rem;
    margin-bottom: -0.3rem;
`
export const TrocaContainer = styled.div`
    width: 100%;
    margin-top: 5px;
    border-top: solid 1px ${ ( { theme } ) => theme.colors.borders };
    padding-top: 0.8rem;
    margin-bottom: 0.8rem;
`
export const TrocaSubcontainer = styled.div`
    width: 100%;
    margin-top: 0.3rem;
`
export const Troca = styled.div`
    width: 100%;
    display: flex;
    margin-bottom: 0.4rem;
    div {
        font-size: 12px;
    }
`
export const Dropdown = styled.div`
    display: flex;
    position: relative;
    margin-right: 0.4rem;
    button {
        padding: 0;
        ::before {
            opacity: 0;
            content: "";
            position: absolute;
            top: 24px;
            right: -1px;
            width: 0px;
            height: 0px;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 10px solid ${ ( { theme } ) => theme.colors.hover };
            clear: both;
        }
    }
    :hover {
        div {
            opacity: 1;
            z-index: 1;
        }
        button::before {
            opacity: 1;
            z-index: 1;
        }
        svg path {
            fill: ${ ( { theme } ) => theme.colors.hover };
        }
    }
`
export const DropdownList = styled.div` 
    width: 350px;
    right: -20px;
    max-height: 200px;
    overflow: hidden;
    overflow-y: auto;
    top: 33px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.8rem 0px;
    position: absolute;
    opacity: 0;
    z-index: -1;
    box-shadow: 0px 0px 10px -2px rgba(0,0,0,0.8);
    border-radius: 5px;
    border: solid 1px ${ ( { theme } ) => theme.colors.floating };
    background: ${ ( { theme } ) => theme.colors.menus };
    font-size: 12px;
    ::-webkit-scrollbar {
        width: 0.8rem;
        background: ${ ( { theme } ) => theme.colors.menus };
    }
    ::-webkit-scrollbar-thumb {
        border-radius: 6px;
        background: ${ ( { theme } ) => theme.colors.highlight };
        border: 0.2rem solid rgba(0, 0, 0, 0);
        background-clip: padding-box;
    }
`
export const DropdownItem = styled.div`
    width: 100%;
    cursor: pointer;
    padding: 0 1rem;
    line-height: 2;
    :hover {
        border-left: solid 5px ${ ( { theme } ) => theme.colors.hover };
        background: ${ ( { theme } ) => theme.colors.highlight };
        color: ${ ( { theme } ) => theme.colors.hover };
    }
`
export const DropdownHistoricoItem = styled.div`
    width: 100%;
    padding: 0 1rem;
    line-height: 2;
`