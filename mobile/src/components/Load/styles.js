import styled from 'styled-components/native'

export const Container = styled.View`
    width: 100%;
    height: 100%;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: ${ ( { theme } ) => theme.colors.background };

    opacity: ${ ( { opacity } ) => opacity };
    position: absolute;
`
export const Logo = styled.Image`
    width: ${ ( { size } ) => `${ size }px` };
    height: ${ ( { size } ) => `${ size }px` };;
    margin-bottom: 50px;
`
export const Loader = styled.ActivityIndicator`
    color: ${ ( { theme } ) => theme.colors.hover };
    width: 60%;
`