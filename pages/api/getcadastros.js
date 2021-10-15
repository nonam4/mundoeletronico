import database from './_database.js'

export default async (req, res) => {

    let empresas = {}
    let dados = await database.collection('/cadastros/').where('ativo', '==', true).orderBy('nomefantasia').get()
    dados.forEach(dado => {

        let empresa = dado.data()
        empresa.id = dado.id

        empresas[empresa.id] = empresa
    })
    //define que os dados ficarão em cache por no minimo 60 segundos, depois revalida tudo novamente
    if (process.env.NODE_ENV === 'development') res.setHeader('Cache-Control', 's-maxage=60000, stale-while-revalidade')
    res.status(200).send(empresas)
}