import Head from 'next/head'
import { ThemeContext } from 'styled-components'
import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDados } from '../../contexts/DadosContext'

import TextField from '../../components/Inputs/TextField'
import Checkbox from '../../components/Inputs/Checkbox'
import Button from '../../components/Inputs/Button'
import Load from '../../components/Load'

import usePersistedState from '../../hooks/usePersistedState'

import * as Notification from '../../workers/notification'
import * as Database from '../../workers/database'
import * as S from './styles'

function Username() {
    const router = useRouter()
    const { colors } = useContext(ThemeContext)
    const { state, dispatch } = useDados()
    const [usuario, setUsuario] = usePersistedState('usuario', undefined)

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [temporario, setTemporario] = useState(true) //username temporário ou definitivo?

    useEffect(() => {
        // inicialmente o usuário será undefined então espera o proximo ciclo
        if (usuario === undefined) return

        // se não tiver usuário salvo mostre o formulário de login
        if (!usuario) return toggleLoad()

        // se os dados estiverem salvos mas não estiver autenticado (quando recarregando a página por exemplo) tente login automático
        if (usuario && !state.autenticado) return reautenticar()

        // se o usuário estiver salvo e autenticado volte para de onde parou ou para adm
        if (usuario && state.autenticado) return router.replace(`/${router.query.fallback || 'impressoras'}`)
    }, [usuario])

    function toggleLoad() {
        dispatch({ type: 'setLoad', payload: !state.load })
    }

    function toggleAutenticado() {
        dispatch({ type: 'setAutenticado', payload: !state.autenticado })
    }

    function reautenticar() {
        let { username, password } = usuario

        // define que está autenticado antes de tentar fazer o login
        toggleAutenticado()

        Database.autenticar(username, password).then(res => {
            setUsuario({ ...res.data, password, temporario: usuario.temporario })
        }).catch(err => {
            // em caso de erro, define que não está mais autenticado
            toggleAutenticado()
            Notification.notificate('Erro', 'Usuário ou password incorretos!', 'danger')
            toggleLoad()
            console.error(err)
        })
    }

    function handleLogin() {
        if (!formularioValido()) return

        // define que está autenticado antes de tentar fazer o login
        toggleAutenticado()
        toggleLoad()

        Database.autenticar(username, password).then(res => {
            setUsuario({ ...res.data, password, temporario })
        }).catch(err => {
            // em caso de erro, define que não está mais autenticado
            toggleAutenticado()
            Notification.notificate('Erro', 'Usuário ou password incorretos!', 'danger')
            toggleLoad()
            console.error(err)
        })
    }

    function formularioValido() {
        if (username.length < 3) {
            Notification.notificate('Atenção', 'Usuário em branco ou inválido!', 'warning')
            return false
        }
        if (password.length < 3) {
            Notification.notificate('Atenção', 'Password em branco ou inválida!', 'warning')
            return false
        }
        return true
    }

    return (
        <S.Container>
            <Head>
                <title>Mundo Eletrônico</title>
                <link rel='icon' href='/icon.png' />
                <meta name='theme-color' content={colors.background}></meta>
            </Head>
            <S.Logo src='/icon.png' />
            <>
                <TextContainer>
                    <TextField onChange={e => setUsername(e.target.value)} value={username} placeholder={'Usuário'} icon={'usuario'} />
                </TextContainer>
                <TextContainer>
                    <TextField onChange={e => setPassword(e.target.value)} value={password} placeholder={'Senha'} icon={'coletor_chave'} type={'password'} />
                </TextContainer>
                <Checkbox text={'Ficar conectado'} changeReturn={() => setTemporario(!temporario)} />
                <Button text={'Entrar'} onClick={handleLogin} />
            </>
            <Load show={state.load} />
        </S.Container>
    )
}

function TextContainer(props) {
    const settings = {
        width: '250px',
        height: '50px',
    }
    return (
        <S.TextFileds width={props.width || settings.width} height={props.height || settings.height}>
            {props.children}
        </S.TextFileds>
    )
}

export default Username