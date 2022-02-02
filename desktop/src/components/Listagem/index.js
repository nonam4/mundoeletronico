import { useContext, useEffect, useState } from 'react'

import { useTela } from '../../contexts/TelaContext'

function Listagem () {
    const currentWindow = window.require( '@electron/remote' ).getCurrentWindow()
    const tela = useTela()

    useEffect( () => {
        setLoad( false )
        test()

        handleWindowClose()
        if ( currentWindow.isVisible() ) return
        // cria o ícone na tray do sistema se a janela não estiver visível
        criarTray()
    }, [] )

    function handleWindowClose () {
        // cuida para que não feche a janela enquanto não preencher os dados
        currentWindow.on( 'close', () => {
            currentWindow.hide()
            criarTray()
            return false
        } )
    }

    function criarTray () {
        window.require( '@electron/remote' ).require( './electron.js' ).criarTray()
    }

    function setLoad ( valor ) {
        tela.dispatch( { type: 'setLoad', payload: valor } )
    }

    function test () {
        setTimeout( () => {
            console.log( 'working' )
            test()
        }, 5000 )
    }

    return (
        <div>Listagem</div>
    )
}

export default Listagem