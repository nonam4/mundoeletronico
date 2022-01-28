import Head from 'next/head'
import { ThemeContext } from 'styled-components'
import { useContext } from 'react'

export default function Index () {

    const { colors } = useContext( ThemeContext )

    return (
        <>
            <Head>
                <title>Mundo Eletrônico</title>
                <link rel='icon' href='/icon.png' />
                <meta name='theme-color' content={ colors.background }></meta>
            </Head>
            <div>
                home page
            </div>
        </>
    )
}

