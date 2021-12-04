import database from './_database.js'
import bcrypt from 'bcryptjs'

export default async ( req, res ) => {

    let { usuario, atendimento } = req.body
    let { username, password } = usuario

    await database.collection( 'usuarios' ).where( 'username', '==', username ).get().then( col => {
        col.forEach( doc => {
            // Compara a senha em string com o Hash armazenado
            if ( bcrypt.compareSync( password, doc.data().hash ) ) {
                usuario = { id: doc.id, ...doc.data() }
                delete usuario.hash
            }
        } )
        if ( !usuario.permissoes.atendimentos.modificar ) return res.status( 403 ).send( 'Usuário sem permissão para isso!' )
        /*
        return database.doc( `/atendimentos/${ atendimento.id }` ).set( atendimento, { merge: true } ).then( () => {
            res.status( 200 ).send( 'Salvo' )
        } )
        */
        res.status( 200 ).send( 'Salvo' )
    } )
}