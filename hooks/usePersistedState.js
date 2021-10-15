import { useState, useEffect } from 'react'

function usePersistedState( key, initialState ) {
    const [state, setState] = useState( initialState )

    function compare( value ) {
        if ( value !== null && value !== 'null' && value !== undefined && value !== 'undefined' ) return true
        return false
    }

    function cleanStorage() {
        localStorage.removeItem( key )
        sessionStorage.removeItem( key )
    }

    function setStorage() {
        if ( state.temporario ) return sessionStorage.setItem( key, JSON.stringify( state ) )
        return localStorage.setItem( key, JSON.stringify( state ) )
    }

    useEffect( () => {
        let storageValue = localStorage.getItem( key ) || sessionStorage.getItem( key )
        return setState( JSON.parse( storageValue ) || null )
    }, [] )

    useEffect( () => {
        if ( compare( state ) ) return setStorage()
        return cleanStorage()
    }, [key, state] )

    return [state, setState]
}

export default usePersistedState