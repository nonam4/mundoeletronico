import styled from 'styled-components'

export const FilterOption = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 1rem 0.5rem;
    cursor: default;
    :hover {
        background: ${ ( { theme } ) => theme.colors.highlight };
        border-left: solid 5px ${ ( { theme } ) => theme.colors.hover };
        svg path{
            fill: ${ ( { theme } ) => theme.colors.hover };
        }
        span {
            left: 0;
            width: 100%;
        }
    }
`
export const FilterItem = styled.div`
    width: 100%;
    display: flex;
    line-height: 40px;
    align-items: center;
    padding-left: 0.5rem;
`
export const FilterIndicator = styled.div`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${ ( { theme } ) => theme.colors.hover };
    position: absolute;
    top: 10px;
    right: 0;
`