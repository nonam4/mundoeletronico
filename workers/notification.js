import { store } from 'react-notifications-component'

export function notificate(titulo, mensagem, tipo) {
    let notification = store.addNotification({
        title: titulo,
        message: mensagem,
        type: tipo,
        insert: "top",
        container: "top-right",
        dismiss: {
            duration: 5000,
            onScreen: true
        }
    })

    return notification
}

export function removeNotification(notification) {
    store.removeNotification(notification)
}