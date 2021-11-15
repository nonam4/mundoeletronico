import styled from 'styled-components'

export const Container = styled.div`
    width: 100%;
    height: 100%;
    min-height: 568px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`
export const Logo = styled.img`
    width: 15rem;
    margin-bottom: 1rem;
`
export const TextTitle = styled.div`
    width: ${ ( { width } ) => width };
    height: ${ ( { height } ) => height };
    margin: 0 1.5rem;
    font-size: 2rem;
`
export const TextSubtitle = styled.div`
    width: ${ ( { width } ) => width };
    height: ${ ( { height } ) => height };
    margin: 0.5rem 1rem;
    font-size: 1rem;
`
export const Bold = styled.span`
    font-weight: 800;
`