import database from '../_database.js'

export default async ( req, res ) => {
    const { os, versao, local, id } = req.query
    const sistema = await database.doc( '/sistema/desktop' ).get()

    function atualizar ( local, server ) {
        if ( typeof local !== 'object' ) local = local.toString().split( '.' )
        if ( typeof server !== 'object' ) server = server.toString().split( '.' )

        for ( let i = 0; i < ( Math.max( local.length, server.length ) ); i++ ) {
            if ( local[ i ] == undefined ) local[ i ] = 0
            if ( server[ i ] == undefined ) server[ i ] = 0

            if ( Number( local[ i ] ) < Number( server[ i ] ) ) return true
            if ( local[ i ] != server[ i ] ) break
        }
    }

    function getUpdateUrl () {
        if ( os === 'win32' ) return sistema.data().winupdateurl
        return sistema.data().linupdateurl
    }

    if ( atualizar( versao, sistema.data().versaoatual ) ) return res.status( 200 ).send( { updateUrl: getUpdateUrl() } )

    await database.doc( `/cadastros/${ id }` ).set( { sistema: { local, versao } }, { merge: true } ).then( () => {
        res.status( 200 ).send( 'Ok' )
    } )
}