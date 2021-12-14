import database from './_database.js'

export default async ( req, res ) => {

    let atendimentos = {
        'Em aberto': {},
        'Feitos': {},
        'Tecnicos': {}
    }
    let cadastros = {
        fornecedor: {},
        particular: {},
        locacao: {}
    }

    let listaCadastros = await database.collection( '/cadastros/' ).where( 'ativo', '==', true ).orderBy( 'nomefantasia' ).get()
    listaCadastros.forEach( itemCadastro => {

        let cadastro = itemCadastro.data()

        if ( cadastro.tipo === 'fornecedor' ) return cadastros[ 'fornecedor' ][ cadastro.id ] = cadastro
        if ( cadastro.tipo === 'particular' ) return cadastros[ 'particular' ][ cadastro.id ] = cadastro
        if ( cadastro.tipo === 'locacao' ) return cadastros[ 'locacao' ][ cadastro.id ] = cadastro
    } )

    let listaAtendimentos = await database.collection( '/atendimentos/' ).get()
    listaAtendimentos.forEach( itemAtendimento => {

        let atendimento = itemAtendimento.data()
        atendimento.id = itemAtendimento.id

        if ( atendimento.feito ) { atendimentos[ 'Feitos' ] = { ...atendimentos[ 'Feitos' ], [ atendimento.id ]: atendimento } }
        else if ( atendimento.responsavel === '' ) { atendimentos[ 'Em aberto' ] = { ...atendimentos[ 'Em aberto' ], [ atendimento.id ]: atendimento } }
        else { atendimentos[ 'Tecnicos' ][ atendimento.responsavel ] = { ...atendimentos[ 'Tecnicos' ][ atendimento.responsavel ], [ atendimento.id ]: atendimento } }
    } )

    res.status( 200 ).send( { atendimentos, cadastros } )
}