import styled from 'styled-components/native'
import * as Sizes from '../../workers/sizes'

export const Container = styled.View`
    width: 100%;
    height: 100%;
    flex: 1;
    align-items: center;
    justify-content: center;
    background: ${ ( { theme } ) => theme.colors.background };
`
export const Logo = styled.Image`
    width: ${ ( { size } ) => Sizes.widthPercentage( `${ size }%` ) };
    height: ${ ( { size } ) => Sizes.widthPercentage( `${ size }%` ) };
    margin-bottom: ${ ( { marginBottom } ) => Sizes.getPxSize( marginBottom ) };
`
export const Content = styled.View`
    width: 65%;
`
