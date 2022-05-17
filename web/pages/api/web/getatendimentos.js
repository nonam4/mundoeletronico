import database from '../_database.js'

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
    let tecnicos = [ { label: 'Em aberto', value: '' } ]

    let listaTecnicos = await database.collection( '/usuarios/' ).get()
    listaTecnicos.forEach( itemTecnico => {
        let tecnico = itemTecnico.data()

        tecnicos.push( { label: tecnico.nome, value: tecnico.nome } )
    } )

    let listaCadastros = await database.collection( '/cadastros/' ).where( 'ativo', '==', true ).orderBy( 'nomefantasia' ).get()
    listaCadastros.forEach( itemCadastro => {

        let cadastro = itemCadastro.data()
        cadastro.impressoras = {}

        if ( cadastro.tipo === 'fornecedor' ) return cadastros[ 'fornecedor' ][ cadastro.id ] = cadastro
        if ( cadastro.tipo === 'particular' ) return cadastros[ 'particular' ][ cadastro.id ] = cadastro
        if ( cadastro.tipo === 'locacao' ) return cadastros[ 'locacao' ][ cadastro.id ] = cadastro
    } )

    let listaAtendimentos = await database.collection( '/atendimentos/' ).get()
    listaAtendimentos.forEach( itemAtendimento => {

        let atendimento = itemAtendimento.data()

        if ( atendimento.feito ) atendimentos[ 'Feitos' ] = { ...atendimentos[ 'Feitos' ], [ atendimento.chave ]: atendimento }
        if ( !atendimento.feito && atendimento.responsavel === '' ) atendimentos[ 'Em aberto' ] = { ...atendimentos[ 'Em aberto' ], [ atendimento.chave ]: atendimento }
        if ( !atendimento.feito && atendimento.responsavel !== '' ) atendimentos[ 'Tecnicos' ][ atendimento.responsavel ] = { ...atendimentos[ 'Tecnicos' ][ atendimento.responsavel ], [ atendimento.chave ]: atendimento }
    } )

    const size = new TextEncoder().encode( JSON.stringify( { atendimentos, cadastros, tecnicos } ) ).length
    const kiloBytes = size / 1024
    const megaBytes = kiloBytes / 1024

    console.log( `atendimentos -> tamanho em MB -> ${ megaBytes }` )

    res.status( 200 ).send( { atendimentos, cadastros, tecnicos } )
}