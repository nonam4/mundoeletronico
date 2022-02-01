import styled from 'styled-components'

export const Container = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
`
export const Input = styled.input`
    width: 100%;
    height: 100%;
    background: transparent;
    color: ${ ( { theme } ) => theme.colors.texts };
    outline: none;
    border: none;
    font-size: 14px;
    border-bottom: solid 1px ${ ( { theme } ) => theme.colors.borders };
    padding: ${ ( { icon } ) => icon !== false ? '22px 39px 8px 44px' : '22px 8px 8px 8px' };
    :focus + div, :not(:placeholder-shown) + div {
        label {
            color: ${ ( { theme } ) => theme.colors.hover };
            font-size: 12px;
            top: 4px;
        }
        span {
            left: 0;
            width: 100%;
        }
    }
`
export const Content = styled.div`
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    padding: 13px 0.5rem;
    pointer-events: none !important;
`
export const Label = styled.label`
    position: absolute;
    top: 15px;
    left: ${ ( { icon } ) => icon !== false ? '45px' : '8px' };
`
export const Highlight = styled.span`
    width: 0px;
    position: absolute;
    bottom: 0;
    left: 50%;
    border-bottom: solid 2px ${ ( { theme, disabled } ) => disabled ? theme.colors.borders : theme.colors.hover };
`
export const Viewer = styled.div`
    cursor: pointer;
    position: absolute;
    height: 20px;
    width: 20px;
    top: 15px;
    right: 0;
    :hover path {
        fill: ${ ( { theme } ) => theme.colors.hover };
    }
`