
import React from 'react'
import { ThemeProvider } from 'styled-components'
import { useColorScheme } from 'react-native'
//import ReactNotification from 'react-notifications-component'

import MainFrame from './components/MainFrame'
import Load from './components/Load'

import claro from './styles/temas/claro'
import escuro from './styles/temas/escuro'


function App () {
    const theme = useColorScheme() === 'dark' ? escuro : claro

    return (
        <ThemeProvider { ...{ theme } }>
            <Load show={ true } />

        </ThemeProvider>
    )
}
//<ReactNotification />
<MainFrame />

export default App
