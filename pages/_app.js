import { ThemeProvider } from 'styled-components'
import { DadosProvider } from '../contexts/DadosContext'

//notifications
import ReactNotification from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import GlobalStyle from '../styles/global'

import usePersistedState from '../utils/usePersistedState'
import light from '../styles/themes/light'
import dark from '../styles/themes/dark'

function App({ Component, pageProps }) {
    const [ theme, setTheme ] = usePersistedState('theme', light)

    function toggleTheme() {
        setTheme(theme.title === 'light' ? dark : light)
    }

    return (
        <ThemeProvider {...{ theme }}>
            <DadosProvider>
                <GlobalStyle />
                <ReactNotification />
                <Component {...pageProps} />
            </DadosProvider>
        </ThemeProvider>
    )
}

export default App
