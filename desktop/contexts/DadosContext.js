import { createContext, useContext, useReducer } from 'react'

const initialData = {
    load: true,
    usuario: undefined,
    tema: undefined,
}

// Context
const DadosContext = createContext( undefined )

// Reducer
function dadosReducer ( state, action ) {
    let { payload } = action
    switch ( action.type ) {
        case 'setLoad':
            return { ...state, load: payload }
        case 'setUsuario':
            return { ...state, usuario: payload }
        case 'setTema':
            return { ...state, tema: payload }
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