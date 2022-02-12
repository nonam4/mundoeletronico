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
    height: 100%;
    width: 350px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
`
export const Linha = styled.div`
    display: flex;
`
export const Divisor = styled.div`
    width: 100%;
    border-radius: 5px;
    background: ${ ( { theme } ) => theme.colors.menus };
    border: solid 1px ${ ( { theme } ) => theme.colors.borders };
    padding: 0.4rem 0 0.4rem 0;
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
export const Info = styled.div`
    font-size: 12px;
    text-align: center;
`
export const Suporte = styled.div`
    text-align: center;
`