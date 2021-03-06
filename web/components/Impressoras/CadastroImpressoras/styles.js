import styled from 'styled-components'

export const Container = styled.div`
    width: ${ ( { sempreVisivel } ) => sempreVisivel ? 'calc(100% - 250px)' : '100%' };
    height: calc(100% - 60px);
    position: absolute;
    top: 60px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 0.8rem 0 0 0.8rem;
    background-color: ${ ( { theme } ) => theme.colors.background };
    :hover {
        z-index: 2;
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
            fill: ${ ( { hover } ) => hover };
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
export const TituloSubContainer = styled.div`
    width: fit-content;
    margin-bottom: 0.4rem;
`
export const Titulo = styled.div`
    width: 100%;
    font-size: 21px;
    text-transform: uppercase;
`
export const Subtitulo = styled.div`
    width: 100%;
    font-size: 14px;
    color: ${ ( { theme } ) => theme.colors.floating };
`
export const DadosColetor = styled.div`
    width: 100%;
    font-size: 12px;
    color: ${ ( { theme } ) => theme.colors.floating };
`
export const FranquiaContainer = styled.div`
    width: calc(100% - 0.8rem);
    display: flex;
    margin-top: 0.4rem;
    border: solid 1px ${ ( { theme } ) => theme.colors.borders };
    border-radius: 5px;
    background-color: ${ ( { theme } ) => theme.colors.menus };
    padding: 0 0.8rem;
    box-shadow: 0px 0px 10px -8px black;
    margin-bottom: 0.8rem;
    @media only screen and (max-width: 1320px) {
        flex-wrap: wrap;
    }
`
export const FranquiaSubcontainer = styled.div`
    width: ${ ( { width } ) => width };
    display: flex;
    border-right: ${ ( { borderRight, theme } ) => borderRight != false ? `solid 1px ${ theme.colors.borders }` : 'none' };
    margin: 0.8rem 0;
    @media only screen and (max-width: 1320px) {
        width: 100%;
        margin: 0;
        padding: 0.8rem 0;
        border-right: none;
        border-top: ${ ( { borderTop, theme } ) => borderTop != false ? `solid 1px ${ theme.colors.borders }` : 'none' };
    }
`
export const FranquiaItem = styled.div`
    width: ${ ( { show } ) => show != false ? '100%' : '0px' };
    opacity: ${ ( { show } ) => show != false ? '1' : '0' };
    z-index: ${ ( { show } ) => show != false ? '0' : '-1' };
    padding: ${ ( { show } ) => show != false ? '0 0.8rem' : '0' };
    border-right: ${ ( { theme, show } ) => show != false ? `solid 1px ${ theme.colors.borders }` : 'none' };
    border-right: ${ ( { border, theme } ) => border != false ? `solid 1px ${ theme.colors.borders }` : 'none' };
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    select {
        font-weight: bold;
        text-align-last: center;
        padding: 0 0.5rem 0.3rem;
        width: fit-content;
    }
    :hover {
        span {
            left: 0;
            width: 100%;
        }
    }
    @media only screen and (max-width: 1320px) {
        border-right: ${ ( { border, theme } ) => border != false ? `solid 1px ${ theme.colors.borders }` : 'none' };
    }
`
export const FranquiaTitulo = styled.div`
    width: 100%;
    font-size: 12px;
    color: ${ ( { theme } ) => theme.colors.floating };
    text-align: center;
    cursor: default;
    height: 1.4rem;
`
export const FranquiaDado = styled.div`
    width: 100%;
    font-weight: bold;
    text-align: center;
    cursor: default;
    height: 1.4rem;
    align-items: center;
    display: flex;
    justify-content: center;
    span {
        display: inline;
        color: ${ ( { theme } ) => theme.colors.verde };
        left: auto !important;
        width: auto !important;
    }
    div {
        span {
            left: 0 !important;
            width: 100% !important;
        }
    }
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
        background: ${ ( { theme } ) => theme.colors.background };
    }
    ::-webkit-scrollbar-thumb {
        border-radius: 8px;
        background: ${ ( { theme } ) => theme.colors.highlight };
        border: 0.3rem solid ${ ( { theme } ) => theme.colors.background };
        background-clip: padding-box;
    }
`
export const Inativas = styled.div`
    width: 100%;
    height: fit-content;
    overflow: hidden;
    overflow-y: auto;

    display: grid;
    grid-template-columns: repeat(4,1fr);
    grid-gap: 0.5rem;
    margin: 0 0.8rem 0.8rem 0;

    ::-webkit-scrollbar {
        width: 1.1rem;
        background: ${ ( { theme } ) => theme.colors.background };
    }
    ::-webkit-scrollbar-thumb {
        border-radius: 8px;
        background: ${ ( { theme } ) => theme.colors.highlight };
        border: 0.3rem solid ${ ( { theme } ) => theme.colors.background };
        background-clip: padding-box;
    }

    @media only screen and (max-width: 1568px) {
        grid-template-columns: repeat(3, 1fr);
    }
    @media only screen and (max-width: 1235px) {
        grid-template-columns: repeat(2, 1fr);
    }
    @media only screen and (max-width: 925px) {
        grid-template-columns: repeat(1, 1fr);
    }
    @media only screen and (max-width: 833px) {
        grid-template-columns: repeat(2, 1fr);
    }
    @media only screen and (max-width: 680px) {
        grid-template-columns: repeat(1, 1fr);
    }
`