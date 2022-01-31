import { createContext, useContext, useReducer } from 'react'

const initialData = {
    load: true
}

// Context
const TelaContext = createContext( undefined )

// Reducer
function telaReducer ( state, action ) {
    let { payload } = action
    switch ( action.type ) {
        case 'setLoad':
            return { ...state, load: payload }
        default:
            return state
    }
}

// Provider
export function TelaProvider ( { children } ) {
    const [ state, dispatch ] = useReducer( telaReducer, initialData )
    const value = { state, dispatch }

    return (
        <TelaContext.Provider value={ value } >
            { children }
        </TelaContext.Provider>
    )
}

// Context Hook
export function useTela () {
    const context = useContext( TelaContext )
    if ( context === undefined ) throw new Error( 'Contexto tela inválido' )
    return context
}