
import React from 'react'
import { ThemeProvider } from 'styled-components'
import { useColorScheme, StatusBar } from 'react-native'
import { DadosProvider, useDados } from './contexts/DadosContext'

import MainFrame from './components/MainFrame'
import Load from './components/Load'

import claro from './styles/temas/claro'
import escuro from './styles/temas/escuro'

function App () {
    return (
        <DadosProvider>
            <View />
        </DadosProvider>
    )
}

function View () {
    const { state } = useDados()
    const isDarkTheme = useColorScheme() === 'dark'
    const theme = isDarkTheme ? escuro : claro

    return (
        <ThemeProvider { ...{ theme } }>
            <StatusBar
                barStyle={ isDarkTheme ? 'light-content' : 'dark-content' }
                backgroundColor={ theme.colors.background }
            />
            <Load show={ state.load } />
            <MainFrame />
        </ThemeProvider>
    )
}

export default App
