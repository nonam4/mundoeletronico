import { createContext, useContext, useReducer, ReactNode } from 'react'

type State = {
    cadastros: Object
    atendimentos: Object
    load: true | false
    usuario: undefined | null | Object
    tema: undefined | Object
    autenticado: true | false
    menu: Object
}

type Action = {
    type: ContextActions
    payload: any
}

type ContextType = {
    state: State
    dispatch: ( action: Action ) => void
}

type ProviderProps = {
    children: ReactNode
}

const initialData = {
    cadastros: {},
    atendimentos: {},
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
const DadosContext = createContext<ContextType | undefined>( undefined )

// Reducer
export enum ContextActions {
    setCadastros,
    setAtendimentos,
    setLoad,
    setUsuario,
    setTema,
    setAutenticado,
    setMenu
}
function dadosReducer( state: State, action: Action ) {
    switch ( action.type ) {
        case ContextActions.setCadastros:
            return { ...state, cadastros: action.payload }
        case ContextActions.setAtendimentos:
            return { ...state, atendimentos: action.payload }
        case ContextActions.setLoad:
            return { ...state, load: action.payload }
        case ContextActions.setUsuario:
            return { ...state, usuario: action.payload }
        case ContextActions.setTema:
            return { ...state, tema: action.payload }
        case ContextActions.setAutenticado:
            return { ...state, autenticado: action.payload }
        case ContextActions.setMenu:
            return { ...state, menu: action.payload }
        default:
            return state
    }
}

// Provider
export function DadosProvider( { children }: ProviderProps ) {
    const [ state, dispatch ] = useReducer( dadosReducer, initialData )
    const value = { state, dispatch }

    return (
        <DadosContext.Provider value={ value } >
            { children }
        </DadosContext.Provider>
    )
}

// Context Hook
export function useDados() {
    const context = useContext( DadosContext )
    if ( context === undefined ) throw new Error( 'Contexto inválido' )
    return context
}