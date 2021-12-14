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
    height: 50px;
    display: flex;
    min-width: ${ ( { minWidth } ) => minWidth ? `${ minWidth }` : '0px' };
    max-width: ${ ( { maxWidth } ) => maxWidth ? `${ maxWidth }` : 'unset' };
    position: relative;
    margin-top: 0.5rem;

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
`
export const ListaNomes = styled.div`
    width: 100%;
    display: block;
    overflow: hidden;
    overflow-y: auto;
    max-height: 300px;
    background: ${ ( { theme } ) => theme.colors.menus };
    ::-webkit-scrollbar {
        width: 1.1rem;
        background: ${ ( { theme } ) => theme.colors.menus };
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
`
export const ContainerDadoCliente = styled.div`
    width: fit-content;
    padding: 0.5rem;
`
export const SubcontainerDadoCliente = styled.div`
    width: 100%;
    display: flex;
`
export const TituloDadoCliente = styled.div`
    width: 100%;
    font-size: 11px;
    color: ${ ( { theme } ) => theme.colors.azul };
    cursor: inherit;
`
export const TextoDadoCliente = styled.div`
    width: 100%;
    color: ${ ( { theme } ) => theme.colors.texts };
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: inherit;
`