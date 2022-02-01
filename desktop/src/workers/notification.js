import { Store } from 'react-notifications-component'

export function notificate ( titulo, mensagem, tipo ) {
    let notification = Store.addNotification( {
        title: titulo,
        message: mensagem,
        type: tipo,
        insert: 'top',
        container: 'bottom-center',
        dismiss: {
            duration: 5000,
            onScreen: true
        }
    } )

    return notification
}

export function removeNotification ( notification ) {
    Store.removeNotification( notification )
}