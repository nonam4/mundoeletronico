import styled from 'styled-components'

export const Container = styled.div`
    width: ${ ( { width } ) => width };
    height: ${ ( { height } ) => height };
    margin: 8px;
    padding: 0;
    padding-left: ${ ( { paddingLeft } ) => paddingLeft ? `${ paddingLeft }` : '8px' };
    padding-right: 8px;
    display: flex;
    align-items: center;
`
export const Input = styled.input.attrs( { type: 'checkbox' } )`
    display: none;
        :checked + label::after {
        transform: rotate( -45deg ) scale( 1 );
    }
        :checked + label::before {
        border: 2px solid ${ ( { theme } ) => theme.colors.hover };
    }
        :focus + label::before {
        outline: 0;
    }
`
export const Label = styled.label`
    width: 100%;
    height: 22px;
    line-height: 22px;
    color: ${ ( { theme } ) => theme.colors.texts };
    display: block;
    padding-left: 40px;
    position: relative;
    cursor: pointer;
        ::before {
        box-sizing: border-box;
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 22px;
        height: 22px;
        border-radius: 3px;
        border: 2px solid ${ ( { theme } ) => theme.colors.borders };
        transition: all ease 0.15s;
    }
        ::after {
        box-sizing: border-box;
        transition: all ease 0.15s;
        content: '';
        display: block;
        width: 12px;
        height: 8px;
        border: solid ${ ( { theme } ) => theme.colors.hover };
        border-width: 0 0 2px 2px;
        transform: rotate( -45deg ) scale( 0 );
        position: absolute;
        top: 5px;
        left: 5px;
    }
        :hover {
            ::before {
            border: 2px solid ${ ( { theme } ) => theme.colors.hover };
        }
    }
`