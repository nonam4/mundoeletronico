import database from '../_database.js'
import { recalcularDados } from '../recalcular'

export default async ( req, res ) => {
    const { data, id } = req.query
    const dadosCadastro = await database.doc( `/cadastros/${ id }` ).get()

    // se o cadastro for excluido retorna um erro
    if ( !dadosCadastro.exists ) return res.status( 404 ).send( 'Cadastro inexistente!' ) // 404 inexistente

    let cadastro = dadosCadastro.data()
    // se o cadastro estiver desativado
    if ( !cadastro.ativo ) return res.status( 401 ).send( 'Cadastro inativo!' ) // 401 não autorizado
    cadastro = recalcularDados( data, cadastro )
    res.status( 200 ).send( { cadastro } )
}