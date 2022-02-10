import { createContext, useContext, useReducer } from 'react'


const initialData = {
    cadastros: {},
    tecnicos: [],
    suprimentos: {
        '1234567890123': { value: '1234567890123', estoque: 7, label: 'Toner 283' },
        '1234567890124': { value: '1234567890124', estoque: 15, label: 'Toner 3500' },
        '1234567890125': { value: '1234567890125', estoque: 3, label: 'Toner 505x' },
    },
    atendimentos: { 'Tecnicos': {} },
    load: true,
    usuario: undefined,
    tema: undefined,
    autenticado: false,
    menu: {
        expandido: false,
        sempreVisivel: false
    }
}

// Context
const DadosContext = createContext( undefined )

// Reducer
function dadosReducer ( state, action ) {
    let { payload } = action
    switch ( action.type ) {
        case 'setCadastros':
            return { ...state, cadastros: payload }
        case 'setTecnicos':
            return { ...state, tecnicos: payload }
        case 'setSuprimentos':
            return { ...state, suprimentos: payload }
        case 'setAtendimentos':
            return { ...state, atendimentos: payload }
        case 'setLoad':
            return { ...state, load: payload }
        case 'setUsuario':
            return { ...state, usuario: payload }
        case 'setTema':
            return { ...state, tema: payload }
        case 'setAutenticado':
            return { ...state, autenticado: payload }
        case 'setMenu':
            return { ...state, menu: payload }
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