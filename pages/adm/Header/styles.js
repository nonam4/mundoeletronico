import styled, { css } from "styled-components"

export const Container = styled.div`
    width: 100%;
    height: 60px;
    background: ${({ theme }) => theme.colors.menus};
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    padding: 0 1rem 0 0;
    border-bottom: solid 1px ${({ theme }) => theme.colors.borders};
`
export const Dropdown = styled.div`
    max-width: 160px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    ${({ forceShow }) => forceShow && css`
        div:nth-child(2) {
            opacity: 1;
            z-index: 1;
        }
        span {
            border-bottom: solid 2px ${({ theme }) => theme.colors.hover};
            color: ${({ theme }) => theme.colors.hover};
        }
        span::after {
            opacity: 1;
            z-index: 1;
        }
        span path {
            fill: ${({ theme }) => theme.colors.hover};
        }
    `}
    :hover {
        div:nth-child(2) {
            opacity: 1;
            z-index: 1;
        }
        span {
            border-bottom: solid 2px ${({ theme }) => theme.colors.hover};
            color: ${({ theme }) => theme.colors.hover};
        }
        span::after {
            opacity: 1;
            z-index: 1;
        }
        span path {
            fill: ${({ theme }) => theme.colors.hover};
        }
    }
`
export const DropdownItem = styled.span`
    border-bottom: solid 2px transparent;
    display: flex;
    align-items: center;
    padding: 0.5rem;
    margin: 0 0 0 0.5rem;
    height: 53px;
    ::after {
        opacity: 0;
        content: "";
        position: absolute;
        bottom: -6px;
        left: 16px;
        width: 0px;
        height: 0px;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 10px solid ${({ theme }) => theme.colors.hover};
        clear: both;
    }
`
export const Foto = styled.img`
    width: 35px;
    margin-left: -7px;
    margin-right: 0.8rem;
    border-radius: 50%;
`
export const Settings = styled.div`
    opacity: 0;
    z-index: -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: ${({ theme }) => theme.colors.menus};
    border: solid 1px ${({ theme }) => theme.colors.floating};
    padding: 0.8rem 0px;
    width: 230px;
    border-radius: 5px;
    position: absolute;
    top: 65px;
    right: ${({ right }) => `${right}px`};
    box-shadow: 0px 0px 10px -2px rgba(0,0,0,0.8);
`
export const SettingsItem = styled.div`
    width: 100%;
    height: ${({ show }) => show == undefined || show ? '100%' : '0px'};
    opacity: ${({ show }) => show == undefined || show ? '1' : '0'};
    z-index: ${({ show }) => show == undefined || show ? '0' : '-1'};
    pointer-events: ${({ show }) => show == undefined || show ? 'auto' : 'none'};
    display: flex;
    align-items: center;
    cursor: pointer;
    line-height: 40px;
    padding: 0 1rem 0 1.5rem;
    :hover {
        border-left: solid 5px ${({ theme }) => theme.colors.hover};
        background: ${({ theme }) => theme.colors.highlight};
        svg path{
            fill: ${({ theme }) => theme.colors.hover};
        }
    }
`