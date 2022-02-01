const os = window.require( 'os' )

export function pegatIpDhcp () {
    return new Promise( resolve => {

        function pegarIp () {
            let ints = os.networkInterfaces()

            function ipLocal () {
                for ( var i in ints ) {
                    var int = ints[ i ]
                    for ( var f in int ) {
                        if ( int[ f ].family === 'IPv4' && !int[ f ].internal )
                            return int[ f ].address
                    }
                }
            }

            let ip = ipLocal()

            if ( !ip ) return setTimeout( () => {
                pegarIp()
            }, 2000 )

            let ipSplit = ip.split( '.' )
            resolve( `${ ipSplit[ 0 ] }.${ ipSplit[ 1 ] }.${ ipSplit[ 2 ] }` )
        }

        pegarIp()
    } )
}