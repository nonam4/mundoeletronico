import { Dimensions, PixelRatio } from 'react-native'

// retorna um valor proporcional baseado na densidade de pixels
export function getSize ( size ) {
    return PixelRatio.getPixelSizeForLayoutSize( size )
}

// retorna um valor proporcional baseado na densidade de pixels (em px)
export function getPxSize ( size ) {
    return `${ PixelRatio.getPixelSizeForLayoutSize( size ) }px`
}

export function widthPercentage ( widthPercent ) {
    const screenWidth = Dimensions.get( 'window' ).width
    return PixelRatio.roundToNearestPixel( screenWidth * parseFloat( widthPercent ) / 100 )
}

export function heightPercentage ( heightPercent ) {
    const screenHeight = Dimensions.get( 'window' ).height
    return PixelRatio.roundToNearestPixel( screenHeight * parseFloat( heightPercent ) / 100 )
}