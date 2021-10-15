import database from './_database.js'
import bcrypt from 'bcryptjs'

export default async (req, res) => {
    let { username, password } = req.body
    let usuario

    await database.collection('usuarios').where('username', '==', username).get().then(col => {
        col.forEach(doc => {
            // Compara a senha em string com o Hash armazenado
            if(bcrypt.compareSync(password, doc.data().hash)) {
                usuario = { id: doc.id, ...doc.data() }
                delete usuario.hash
            }
        })
        // Checa se o usuário é valido
        usuario? res.status(200).send(usuario) : res.status(403).send('Shall not pass!')
    })
}