import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    background: ${ ( { theme } ) => theme.colors.menus };
    border-radius: 5px;
    border: solid 1px ${ ( { theme } ) => theme.colors.vermelho };
    padding: 0 0.8rem 0 0.8rem;
    box-shadow: 0px 0px 10px -8px black;
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
`
export const Titulo = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`
export const TituloSerial = styled.div`
    font-size: 12px;
    line-height: 12px;
    color: ${ ( { theme } ) => theme.colors.floating };
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`
export const TituloSubcontainer = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    height: 48px;
`