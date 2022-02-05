import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function initialize () {

    const CREDENTIALS = JSON.parse( process.env.CREDENTIALS )
    try {
        // se o app já estiver iniciado já retorna ele
        return getFirestore()
    } catch ( err ) {
        // caso o app não esteja iniciado, inicie e depois retorne
        initializeApp( {
            credential: cert( CREDENTIALS )
        } )
        return getFirestore()
    }
}

export default initialize()