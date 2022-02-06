import { createGlobalStyle } from 'styled-components'

export default createGlobalStyle` 
    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus,
    textarea:-webkit-autofill,
    textarea:-webkit-autofill:hover,
    textarea:-webkit-autofill:focus,
    select:-webkit-autofill,
    select:-webkit-autofill:hover,
    select:-webkit-autofill:focus {
        -webkit-text-fill-color: ${ ( { theme } ) => theme.colors.texts };
        box-shadow: 0 0 0px 1000px transparent inset;
        transition: background-color 5000s ease-in-out 0s;
    }
    * {
        box-sizing: border-box;
        padding: 0;
        margin: 0;
        transition: all ease 0.15s, color ease 0.05s, font-size none;
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        -webkit-tap-highlight-color: transparent;
    }
    [data-rbd-drag-handle-context-id] {
        transition: none;
    }
    html {
        position: fixed;
        height: 100vh;
        width: 100vw;
    }
    body {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        background: ${ ( { theme } ) => theme.colors.background };
        font-size: 14px;
        color: ${ ( { theme } ) => theme.colors.texts };
    }
    #root{
        height: 100vh;
        width: 100vw;
        display: flex;
        overflow: hidden;
    }
    .notification {
        padding: 0px !important;
        background-color: transparent !important;
        box-shadow: none !important;
        transition: all ease 0.15s !important;
    }
    .rnc__notification-container--bottom-center{
        left: calc(50% - 163px) !important;
    }
    .rnc__notification-message {
        white-space: pre-wrap;
    }
`