import { useState, useEffect } from 'react'
const fs = window.require( 'fs' )
const { app } = window.require( '@electron/remote' )

function usePersistedState ( initialState ) {
    const [ primeiroRender, setPrimeiroRender ] = useState( true )
    const [ state, setState ] = useState( initialState )

    function jsonPath () {
        return `${ app.getAppPath() }/settings.json`
    }

    function setStorage () {
        fs.writeFile( jsonPath(), JSON.stringify( state ), err => {
            if ( err ) console.log( err )
        } )
    }

    useEffect( () => {
        // no primeiro render vai tentar ler os arquivos locais
        // se der algum erro ele apenas grava os dados padrões
        fs.readFile( jsonPath(), 'utf8', ( err, dados ) => {
            if ( err ) return setStorage()
            setState( JSON.parse( dados ) )
            setPrimeiroRender( false )
        } )
    }, [] )

    useEffect( () => {
        // previne que o sistema grave os dados padrões
        // antes de terminar de ler os dados locais
        if ( primeiroRender ) return setPrimeiroRender( false )
        setStorage()
    }, [ state ] )

    return [ state, setState ]
}

export default usePersistedState