import axios from 'axios'

export default async ( req, res ) => {

    axios.post( 'http://localhost:3000/api/sincronizador',
        { acao: 'gravarImpressora', 'dados': { cliente: '0000000000000', impressora: { BRBSJ6367W: { ip: '192.168.2.249', leituras: { '2021-07': { final: { dia: 23, valor: 235528 } } } } } } } )

    res.status( 200 ).send( 'Ok novo' )
}