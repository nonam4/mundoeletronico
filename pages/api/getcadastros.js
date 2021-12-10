import database from './_database.js'

export default async ( req, res ) => {

    let empresas = {}
    let dados = await database.collection( '/cadastros/' ).where( 'ativo', '==', true ).orderBy( 'nomefantasia' ).get()
    dados.forEach( dado => {

        let empresa = dado.data()
        empresa.id = dado.id

        empresas[ empresa.id ] = empresa
    } )

    res.status( 200 ).send( empresas )
}