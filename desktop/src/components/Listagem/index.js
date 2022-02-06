import { useContext, useEffect, useState } from 'react'

import { useTela } from '../../contexts/TelaContext'
import * as Database from '../../workers/database'

function Listagem () {
    const currentWindow = window.require( '@electron/remote' ).getCurrentWindow()
    const tela = useTela()

    useEffect( () => {
        loop()

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

    // loop principal do sistema, a cada hora irá realizar a mesma ação novamente
    function loop () {

        checkUpdates()
        setTimeout( () => {
            loop()
        }, 3600000 )
    }

    function checkUpdates () {

    }

    return (
        <div>Listagem</div>
    )
}

export default Listagem