import styled from 'styled-components'

export const Content = styled.div`
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 0.5rem 0 0;
    margin-top: 0.4rem;
    max-height: ${ ( { expandido } ) => expandido ? '300px' : '0px' };
    opacity: ${ ( { expandido } ) => expandido ? '1' : '0' };
    ::-webkit-scrollbar {
        width: 0.8rem;
        background: ${ ( { theme } ) => theme.colors.background };
    }
    ::-webkit-scrollbar-thumb {
        border-radius: 6px;
        background: ${ ( { theme } ) => theme.colors.highlight };
        border: 0.2rem solid rgba(0, 0, 0, 0);
        background-clip: padding-box;
    }
`
export const Atendimentos = styled.div`
    width: 100%;
    font-size: 14px;
    display: flex;
    background: ${ ( { theme } ) => theme.colors.menus };
    border: solid 1px ${ ( { theme } ) => theme.colors.borders };
    margin-top: 0.2rem;
    border-radius: 5px;
    cursor: ${ ( { draggable } ) => draggable ? 'grab' : 'default' };
`
export const AtendimentoContent = styled.div`
    width: 100%;
    display: flex;
    cursor: inherit;
    border-right: solid 1px ${ ( { theme } ) => theme.colors.borders };
    @media only screen and (max-width: 1060px) {
        flex-wrap: wrap;
    }
    @media only screen and (max-width: 833px) {
        flex-wrap: nowrap;
    }
    @media only screen and (max-width: 800px) {
        flex-wrap: wrap;
    }
`
export const AtendimentoField = styled.div`
    padding: 0 0.6rem;
    margin: 0.2rem 0;
    display: grid;
    cursor: inherit;
    border-right: solid 1px ${ ( { theme } ) => theme.colors.borders };
    :nth-of-type(1) {
        min-width: 145px;
        max-width: 145px;
    }
    :nth-of-type(2) {
        width: 200px;
        @media only screen and (max-width: 1060px) {
            width: calc(100% - (145px * 2));
        }
        @media only screen and (max-width: 842px) {
            width: calc(100% - 145px);
            border: none;
        }
        @media only screen and (max-width: 833px) {
            width: 200px;
            border-right: solid 1px ${ ( { theme } ) => theme.colors.borders };
        }
        @media only screen and (max-width: 800px) {
            width: calc(100% - (145px * 2));
        }
        @media only screen and (max-width: 568px) {
            width: calc(100% - 145px);
            border: none;
        }
    }
    :nth-of-type(3) {
        min-width: 145px;
        max-width: 145px;
        @media only screen and (max-width: 1060px) {
            border: none;
        }
        @media only screen and (max-width: 842px) {
            border-right: solid 1px ${ ( { theme } ) => theme.colors.borders };
        }
        @media only screen and (max-width: 833px) {

            border-right: solid 1px ${ ( { theme } ) => theme.colors.borders };
        }
        @media only screen and (max-width: 800px) {
            border: none;
        }
        @media only screen and (max-width: 568px) {
            border-right: solid 1px ${ ( { theme } ) => theme.colors.borders };
        }
    }
    :nth-of-type(4) {
        width: 100%;
        border: none;
        @media only screen and (max-width: 842px) {
            width: calc(100% - 145px);
        }
        @media only screen and (max-width: 834px) {
            width: 100%;
        }
        @media only screen and (max-width: 568px) {
            width: calc(100% - 145px);
        }
    }
`
export const AtendimentoIndicador = styled.span`
    width: 100%;
    font-size: 11px;
    color: ${ ( { theme } ) => theme.colors.azul };
    cursor: inherit;
`
export const AtendimentoDado = styled.div`
    width: 100%;
    color: ${ ( { theme } ) => theme.colors.texts };
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: inherit;
`
export const Settings = styled.div`
    padding: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-width: 87px;
    @media only screen and (max-width: 450px) {
        flex-direction: column;
        justify-content: space-between;
        min-width: 55px;
        min-height: 90px;
    }
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
            fill: ${ ( { hover } ) => hover };
        }
    }
`