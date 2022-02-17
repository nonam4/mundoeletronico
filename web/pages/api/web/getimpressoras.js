import database from '../_database.js'
import { recalcularDados } from '../recalcular'

export default async ( req, res ) => {

    const { data, listando } = JSON.parse( req.query.filtros )
    const listaCadastros = await database.collection( '/cadastros/' ).where( 'ativo', '==', true ).where( 'tipo', '==', 'locacao' ).orderBy( 'nomefantasia' ).get()

    let cadastros = { locacao: {} }

    listaCadastros.forEach( itemCadastro => {

        let cadastro = recalcularDados( data, itemCadastro.data() )
        switch ( listando ) {
            case 'todos':
                cadastros[ 'locacao' ][ cadastro.id ] = cadastro
                break
            case 'excedentes':
                if ( cadastro.excedentes > 0 ) cadastros[ 'locacao' ][ cadastro.id ] = cadastro
                break
            case 'atrasos':
                if ( cadastro.atraso ) cadastros[ 'locacao' ][ cadastro.id ] = cadastro
                break
            case 'abastecimentos':
                if ( cadastro.abastecimento ) cadastros[ 'locacao' ][ cadastro.id ] = cadastro
                break
        }
    } )

    res.status( 200 ).send( { cadastros } )
}