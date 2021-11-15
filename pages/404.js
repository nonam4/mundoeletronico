import Head from 'next/head'
import { ThemeContext } from 'styled-components'
import { useEffect, useContext } from 'react'
import { useDados } from '../contexts/DadosContext'
import { useRouter } from 'next/router'

import * as S from '../styles/404'

function NotFound () {
    const { colors } = useContext( ThemeContext )
    const { dispatch } = useDados()
    const router = useRouter()

    useEffect( () => {
        setLoad( false )
    }, [] )

    function setLoad ( valor ) {
        dispatch( { type: 'setLoad', payload: valor } )
    }

    return (
        <S.Container>
            <Head>
                <title>Mundo Eletrônico</title>
                <link rel='icon' href='/icon.png' />
                <meta name='theme-color' content={ colors.background }></meta>
            </Head>
            <S.Logo src='/icon.png' />
            <S.TextTitle>
                Houston, temos um problema!
            </S.TextTitle>
            <S.TextSubtitle>
                A página <S.Bold> { router.asPath } </S.Bold> não pode ser encontrada.
            </S.TextSubtitle>
        </S.Container>
    )
}

export default NotFound