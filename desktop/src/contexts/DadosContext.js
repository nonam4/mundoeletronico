import { createContext, useContext, useReducer } from 'react'

const initialData = {
    id: '',
    local: '',
    proxy: false,
    user: '',
    pass: '',
    host: '',
    port: 8080,
    dhcp: true,
    ip: '',
    tema: undefined
}

// Context
const DadosContext = createContext( undefined )

// Reducer
function dadosReducer ( state, action ) {
    let { payload } = action
    switch ( action.type ) {
        case 'setId':
            return { ...state, id: payload }
        case 'setLocal':
            return { ...state, local: payload }
        case 'setProxy':
            return { ...state, proxy: payload }
        case 'setUser':
            return { ...state, user: payload }
        case 'setPass':
            return { ...state, pass: payload }
        case 'setHost':
            return { ...state, host: payload }
        case 'setPort':
            return { ...state, port: payload }
        case 'setDhcp':
            return { ...state, dhcp: payload }
        case 'setIp':
            return { ...state, ip: payload }
        case 'setTema':
            return { ...state, tema: payload }
        case 'setAll':
            return { ...payload }
        default:
            return state
    }
}

// Provider
export function DadosProvider ( { children } ) {
    const [ state, dispatch ] = useReducer( dadosReducer, initialData )
    const value = { state, dispatch }

    return (
        <DadosContext.Provider value={ value } >
            { children }
        </DadosContext.Provider>
    )
}

// Context Hook
export function useDados () {
    const context = useContext( DadosContext )
    if ( context === undefined ) throw new Error( 'Contexto Dados inválido' )
    return context
}