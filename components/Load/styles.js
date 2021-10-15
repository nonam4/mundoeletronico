import styled, { keyframes } from 'styled-components'

const rotate = keyframes`
    100% { transform: rotate(360deg); }
`

const dash = keyframes`
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -35px;
    }
    100% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -124px;
    }
`

export const Container = styled.div`
    z-index: ${({ zindex }) => zindex};
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => theme.colors.background};
    position: absolute;
    opacity: ${({ opacity }) => opacity};
    transition: all ease 0.25s;
`
export const Logo = styled.img`
    width: 15rem;
    margin-bottom: 50px;
`
export const Loader = styled.div`
    position: relative;
    margin: 0 auto;
    width: 40px;
    ::before {
        content: '';
        display: block;
        padding-top: 100%;
    }
`
export const Circle = styled.svg.attrs({ 
    version: '1.1', 
    xmlns: 'http://www.w3.org/2000/svg', 
    xmlnsXlink: 'http://www.w3.org/1999/xlink',
})`
    animation: ${rotate} 2s linear infinite;
    height: 100%;
    transform-origin: center center;
    width: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
`
export const Spinner = styled.circle`
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
    animation: ${dash} 1.5s ease-in-out infinite;
    stroke: ${({ theme }) => theme.colors.hover};
    stroke-linecap: round;
`