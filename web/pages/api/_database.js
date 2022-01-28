import * as admin from 'firebase-admin'

function initialize () {
    try {
        // se o app já estiver iniciado já retorna ele
        return admin.firestore()
    } catch ( err ) {
        // caso o app não esteja iniciado, inicie e depois retorne
        admin.initializeApp( {
            credential: admin.credential.cert( JSON.parse( process.env.CREDENTIALS ) )
        } )
        return admin.firestore()
    }
}

export default initialize()