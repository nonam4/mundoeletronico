import { useContext } from 'react'
import styled, { ThemeContext } from "styled-components"
import icons from './index'

const Svg = styled.svg.attrs( {
    version: '1.1',
    xmlns: 'http://www.w3.org/2000/svg',
    xmlnsXlink: 'http://www.w3.org/1999/xlink',
} )`
    width: ${ ( { width } ) => width }px;
    height: ${ ( { height } ) => height }px;
    margin-right: ${ ( { margin } ) => margin }rem;
`

function UnderlineIcon ( props ) {
    const { colors } = useContext( ThemeContext )
    const settings = {
        width: 20,
        height: 20,
        margin: '0.8',
        color: colors.texts,
        name: 'undefined'
    }
    return (
        <Svg viewBox="0 0 200 200" height={ props.height || settings.height } width={ props.width || settings.width }
            margin={ props.margin || settings.margin } onClick={ props.onClick }>
            <path fill={ props.color || settings.color } d={ icons[ props.name || settings.name ] } />
            { props.title && <title>{ props.title }</title> }
        </Svg>
    )
}

export default UnderlineIcon