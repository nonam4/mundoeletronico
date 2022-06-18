type category = 'info' | 'warn' | 'error' | 'success'

export type DropdownType = {
    alertWithType: ( type: category, title: string, message: string ) => void
}

export default class Notification {
    static dropDown: DropdownType

    static setDropDown( dropDown: DropdownType ) {
        this.dropDown = dropDown
    }

    static notificate( tipo: category, titulo: string, menssagem: string ) {
        this.dropDown.alertWithType( tipo, titulo, menssagem )
    }
}
