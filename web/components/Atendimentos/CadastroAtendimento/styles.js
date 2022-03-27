import styled from 'styled-components'

export const Container = styled.div`
    width: ${ ( { sempreVisivel } ) => sempreVisivel ? 'calc(100% - 250px)' : '100%' }; 
    height: 100%;
    position: absolute;
    background-color: ${ ( { theme } ) => theme.colors.background };
    z-index: 3;
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
        background: ${ ( { theme } ) => theme.colors.background };
    }
    ::-webkit-scrollbar-thumb {
        border-radius: 8px;
        background: ${ ( { theme } ) => theme.colors.highlight };
        border: 0.3rem solid ${ ( { theme } ) => theme.colors.background };
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
    margin-left: ${ ( { marginLeft } ) => marginLeft ? `${ marginLeft }rem` : '0px' };
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
export const Titulo = styled.div`
    font-size: 24px;
    text-transform: uppercase;
    line-height: 48px;
`
export const SubTitulo = styled.label`
    color: #0070f3;
    font-size: 12px;
    position: absolute;
    top: 4px;
    left: 0.5rem; 
`
export const LinhaContainer = styled.div`
    width: 100%;
    padding: 0 0.8rem 0.8rem 0.8rem;
    margin: 0.8rem 0.8rem 0.8rem 0;
    border: solid 1px ${ ( { theme } ) => theme.colors.borders };
    border-radius: 5px;
    background-color: ${ ( { theme } ) => theme.colors.menus };

    @media only screen and (max-width: 600px) {
        display: block;
    }
`
export const LinhaSubContainer = styled.div`
    width: 100%;
    border-top: ${ ( { borderTop, theme } ) => borderTop == true && `solid 1px ${ theme.colors.borders }` };
`
export const Linha = styled.div`
    width: 100%;
    height: 50px;
    display: flex;
    min-width: ${ ( { minWidth } ) => minWidth ? `${ minWidth }` : '0px' };
    max-width: ${ ( { maxWidth } ) => maxWidth ? `${ maxWidth }` : 'unset' };
    position: relative;
    margin-top: 0.5rem;
    align-items: flex-end;

    @media only screen and (max-width: 600px) {
        min-width: ${ ( { important, minWidth } ) => important ? `${ minWidth }` : 'unset' };
        max-width: ${ ( { important, maxWidth } ) => important ? `${ maxWidth }` : 'unset' };
        width: 100%;
        
        div {
                align-items: end;
                display: flex;
            }
    }   

    div {
        width: 100%;
    }

    select {
        text-align-last: left;
        font-weight: bold;
        padding: 0 0.5rem 0.3rem;
        border-bottom: solid 1px ${ ( { theme } ) => theme.colors.borders };
        position: absolute;
        bottom: 0;

        @media only screen and (max-width: 600px) {
            width: 100%;
        }
    }

    input {
        text-align: left;
        padding-left: 0.5rem;
    }

    span {
        left: ${ ( { forceHover } ) => forceHover && '0' };
        width: ${ ( { forceHover } ) => forceHover && '100%' };
    }

    :hover {
        span {
            left: 0;
            width: 100%;
        }
    }
`
export const SubLinha = styled.div`
    width: 100%;
    display: flex;
    min-width: ${ ( { minWidth } ) => minWidth ? `${ minWidth }` : '0px' };
    max-width: ${ ( { maxWidth } ) => maxWidth ? `${ maxWidth }` : 'unset' };
    position: relative;

    @media only screen and (max-width: 600px) {
        min-width: ${ ( { important, minWidth } ) => important ? `${ minWidth }` : 'unset' };
        max-width: ${ ( { important, maxWidth } ) => important ? `${ maxWidth }` : 'unset' };
        width: 100%;
        
        div {
                width: 100%;
                align-items: end;
                display: flex;
            }
    }   

    select {
        text-align-last: center;
        width: fit-content;
        font-weight: bold;
        padding: 0 0.5rem 0.3rem;
        border-bottom: solid 1px ${ ( { theme } ) => theme.colors.borders };
        position: absolute;
        bottom: 0;

        @media only screen and (max-width: 600px) {
            width: 100%;
        }
    }
`
export const SobLinha = styled.div`
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
    height: 1px;
`
export const VerticalSpacer = styled.div`
    min-height: 0.8rem;
    max-height: 0.8rem;
    width: 1px;    
`
export const DadosCadastro = styled.div`
    width: 100%;
    font-size: 12px;
    color: ${ ( { theme } ) => theme.colors.floating };
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
export const ListaNomesContainer = styled.div`
    width: 100%;
    display: block;
    justify-content: space-between;
    align-items: flex-end;
    position: relative;
`
export const ListaNomes = styled.div`
    position: absolute;
    z-index: 99;
    width: 100%;
    display: block;
    overflow: hidden;
    overflow-y: auto;
    max-height: 300px;
    background: ${ ( { theme } ) => theme.colors.menus };
    padding: 0.8rem 0 0.8rem 0.8rem;
    border: solid 1px ${ ( { theme } ) => theme.colors.floating };
    border-top: none;
    box-shadow: 0px 0px 10px -2px rgba(0,0,0,0.8);
    border-radius: 0 0 5px 5px;
    ::-webkit-scrollbar {
        width: 1.1rem;
        background: ${ ( { theme } ) => theme.colors.menus };
        border-radius: 5px;
    }
    ::-webkit-scrollbar-thumb {
        border-radius: 8px;
        background: ${ ( { theme } ) => theme.colors.highlight };
        border: 0.3rem solid ${ ( { theme } ) => theme.colors.menus };
        background-clip: padding-box;
    }
`
export const ItemListaNomes = styled.div`
    width: 100%;
    border-bottom: solid 1px ${ ( { theme } ) => theme.colors.borders };
    cursor: pointer;
    padding: 0.5rem;
    
    :hover {
        background: ${ ( { theme } ) => theme.colors.highlight };
    }
`
export const DadosCliente = styled.div`
    width: 100%;
    margin: 0.4rem 0 0 8px;
`
export const ContainerDadoCliente = styled.div`
    width: 100%;
`
export const SubContainerDadoCliente = styled.div`
    width: 100%;
    display: flex;
    align-items: flex-end;

    @media only screen and (max-width: 600px) {
        display: ${ ( { displayBlock } ) => displayBlock != true ? 'flex' : 'block' };
    }
`
export const TextoDadoCliente = styled.div`
    width: fit-content;
    color: ${ ( { theme } ) => theme.colors.texts };
    white-space: ${ ( { lineBreak } ) => lineBreak != true ? 'nowrap' : 'normal' };
    overflow: ${ ( { over } ) => over != true ? 'visible' : 'hidden' };
    text-overflow: ${ ( { over } ) => over != true ? 'clip' : 'ellipsis' };
    cursor: inherit;

    span {
        overflow: hidden;
        white-space: nowrap;
        font-size: 11px;
        color: ${ ( { theme } ) => theme.colors.azul };
        cursor: inherit;
        margin-right: 0.2rem;
    }

    a {
        text-decoration: none;
        color: ${ ( { theme } ) => theme.colors.texts };
    }

    @media only screen and (max-width: 600px) {
        width: 100%;
    }
`
export const Separador = styled.div`
    border-left: ${ ( { border, theme } ) => border ? `solid 1px ${ theme.colors.borders }` : 'none' };
    margin: 0 0.8rem 3px 0.8rem;
    height: 10px;

    @media only screen and (max-width: 600px) {
        display: ${ ( { lineBreak } ) => lineBreak == true && 'none' };
    }
`
export const MotivoContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
`