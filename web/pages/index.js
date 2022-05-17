import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Index () {

    const router = useRouter()

    useEffect( () => {
        router.replace( '/login' )
    }, [] )

    return (
        <>
            <Head>
                <title>Mundo Eletrônico</title>
                <link rel='icon' href='/icon.png' />
                <meta name='theme-color' content={ colors.background }></meta>
            </Head>
            <div>Dashboard</div>
        </>
    )
}

