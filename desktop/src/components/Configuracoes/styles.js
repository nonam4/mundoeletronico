import styled from 'styled-components'

export const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`
export const SubCointaner = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
`
export const DivisorContainerEsquerda = styled.div`
    width: 350px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
`
export const DivisorContainerDireita = styled.div`
    width: 350px;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
`
export const Linha = styled.div`
    display: flex;
`
export const Divisor = styled.div`
    width: 0px;
    height: 75%;
    border: solid 1px ${ ( { theme } ) => theme.colors.borders };
`
export const Logo = styled.img`
    width: 12rem;
    margin-top: 2.5rem;
    margin-bottom: 1rem;
`
export const TextFileds = styled.div`
    width: ${ ( { width } ) => width };
    height: ${ ( { height } ) => height };
    margin: 0.5rem ${ ( { marginRight } ) => marginRight } 0.5rem ${ ( { marginLeft } ) => marginLeft };
`
export const Button = styled.div`
    margin-bottom: 0.8rem;
`