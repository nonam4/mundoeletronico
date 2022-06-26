import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import icons from './index'
import Svg, { Path } from 'react-native-svg'

import * as Sizes from '../../workers/sizes'


function UnderlineIcon ( props ) {
    const { colors } = useContext( ThemeContext )
    const settings = {
        size: 9,
        margin: 12,
        color: colors.texts,
        name: 'undefined'
    }

    return (
        <Svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width={ Sizes.getPxSize( props.size || settings.size ) }
            height={ Sizes.getPxSize( props.size || settings.size ) } marginRight={ Sizes.getSize( props.margin || settings.margin ) } onClick={ props.onClick }>
            <Path fill={ props.color || settings.color } d={ icons[ props.name || settings.name ] } />
        </Svg>
    )
}

export default UnderlineIcon