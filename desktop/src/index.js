import React from 'react'
import ReactDOM from 'react-dom'
import { DadosProvider } from './contexts/DadosContext'
import { TelaProvider } from './contexts/TelaContext'

import Main from './components/MainFrame'

// notificações
import { ReactNotifications } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'

ReactDOM.render(
    <React.StrictMode>
        <DadosProvider>
            <TelaProvider>
                <ReactNotifications />
                <Main />
            </TelaProvider>
        </DadosProvider>
    </React.StrictMode>,
    document.getElementById( 'root' )
)