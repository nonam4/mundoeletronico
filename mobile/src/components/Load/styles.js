import styled from 'styled-components/native'
import * as Sizes from '../../workers/sizes'

export const Container = styled.View`
    width: 100%;
    height: 100%;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: ${ ( { theme } ) => theme.colors.background };
    position: absolute;
`
// width e height são do mesmo tamanho então mantemos os dois com o widthPercentage
export const Logo = styled.Image`
    width: ${ ( { size } ) => Sizes.widthPercentage( `${ size }%` ) };
    height: ${ ( { size } ) => Sizes.widthPercentage( `${ size }%` ) };
    margin-bottom: ${ ( { marginBottom } ) => Sizes.getPxSize( marginBottom ) };
`
export const Loader = styled.ActivityIndicator`
    color: ${ ( { theme } ) => theme.colors.hover };
`