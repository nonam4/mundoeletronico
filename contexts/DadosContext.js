import { createContext, useContext, useReducer } from 'react'

const initialData = {
    cadastros: {}, 
    atendimentos: {},
    load: true,
    tema: 'light',
    usuario: null,
    autenticado: false,
    menu: {
        expandido: false,
        sempreVisivel: false
    }
}

// Context
const DadosContext = createContext(undefined)

// Reducer
function dadosReducer(state, action) {
    switch(action.type) {
        case 'setCadastros':
            return {...state, cadastros: action.payload}
        case 'setAtendimentos':
            return {...state, atendimentos: action.payload}
        case 'setUsuario':
            return {...state, usuario: action.payload}
        case 'setAutenticado':
            return {...state, autenticado: action.payload}
        case 'setLoad':
            return {...state, load: action.payload}
        case 'setMenu':
            return {...state, menu: action.payload}
        default: 
            return state
    }
}

// Provider
export function DadosProvider({children}) {
    const [ state, dispatch ] = useReducer(dadosReducer, initialData)
    const value = { state, dispatch }

    return (
        <DadosContext.Provider value={value} >
            {children}
        </DadosContext.Provider>
    )
}

// Context Hook
export function useDados() {
    const context = useContext(DadosContext)
    if (context === undefined) throw new Error('Contexto inválido')
    return context
}