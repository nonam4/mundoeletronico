import React, { createContext, useContext, useReducer } from 'react'

const initialData = {
    atendimentos: {},
    load: true,
    usuario: undefined,
    autenticado: false,
    versao: undefined
}

// Context
const DadosContext = createContext( undefined )

// Reducer
function dadosReducer ( state, action ) {
    let { payload } = action
    switch ( action.type ) {
        case 'setAtendimentos':
            return { ...state, atendimentos: payload }
        case 'setLoad':
            return { ...state, load: payload }
        case 'setUsuario':
            return { ...state, usuario: payload }
        case 'setAutenticado':
            return { ...state, autenticado: payload }
        case 'setVersao':
            return { ...state, versao: payload }
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
    if ( context === undefined ) throw new Error( 'Contexto inválido' )
    return context
}