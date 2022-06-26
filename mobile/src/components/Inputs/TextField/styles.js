import styled from 'styled-components/native'
import * as Sizes from '../../../workers/sizes'

export const Container = styled.View`
    width: 100%;
    height: ${ Sizes.getPxSize( 18 ) };
    position: relative;
    justify-content: center;
`
export const Input = styled.TextInput`
    width: 100%;
    height: 100%;
    color: ${ ( { theme } ) => theme.colors.texts };
    font-size: 16px;
    border-bottom-width: 1px;
    border-bottom-color: ${ ( { theme } ) => theme.colors.borders };
    padding: ${ ( { icon } ) => icon !== false ? `${ Sizes.getPxSize( 8 ) } ${ Sizes.getPxSize( 15 ) } ${ Sizes.getPxSize( 3 ) } ${ Sizes.getPxSize( 17 ) }` : `${ Sizes.getPxSize( 8 ) } ${ Sizes.getPxSize( 3 ) } ${ Sizes.getPxSize( 3 ) } ${ Sizes.getPxSize( 3 ) }` };
`;
export const Content = styled.View`
    width: 100%;
    height: 100%;
    position: absolute;
    pointer-events: none !important;
    padding-left: ${ Sizes.getPxSize( 2 ) };
    padding-bottom: ${ Sizes.getPxSize( 2 ) };
    justify-content: center;
`
export const Highlight = styled.View`
    width: 100%;
    height: 0px;
    position: absolute;
    bottom: 0;
    border-bottom-width: 2px;
    border-bottom-color: ${ ( { theme } ) => theme.colors.hover };
`
export const Label = styled.Text`
    position: absolute;
    left: ${ ( { icon } ) => icon !== false ? `${ Sizes.getPxSize( 17 ) }` : `${ Sizes.getPxSize( 4 ) } ` };
    pointer-events: none !important;
`
export const Viewer = styled.TouchableHighlight`
    width: ${ Sizes.getPxSize( 9 ) };
    position: absolute;
    right: ${ Sizes.getPxSize( 2 ) };
`