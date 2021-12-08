import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { useDados } from '../../../contexts/DadosContext'
import set from 'lodash/fp/set'
import { ThemeContext } from 'styled-components'

import Header from '../../Header'
import MenuIcon from '../../Icons/MenuIcon'
import Checkbox from '../../Inputs/Checkbox'
import TextField from '../../Inputs/TextField'
import SimpleTextField from '../../Inputs/SimpleTextField'
import Select from '../../Inputs/Select'

import * as Database from '../../../workers/database'
import * as Notification from '../../../workers/notification'
import * as S from './styles'

function Expandido () {
    // variaveis do contexto, disponível em todo o sistema
    const { state, dispatch } = useDados()
    // cores do tema
    const { colors } = useContext( ThemeContext )
    const router = useRouter()
    // variaveis sobre a visibilidade do menu lateral
    const { expandido, sempreVisivel } = state.menu
    // data atual
    const data = new Date()
    // atendimento com todos os dados limpos
    const limpo = {
        id: data.getTime()
    }
    // decide se vai voltar os dados para o padrão e desfazer as alterações
    const [ rollback, setRollback ] = useState( false )
    // valor padrão do cadastro, usado apenas para comparar para desfazer alterações
    const [ cadastro, setCadastro ] = useState( limpo )
    // cadastro sendo editado no momento
    const [ editado, setEditado ] = useState( limpo ) //somente o cliente editado

    // quando iniciar o sistema
    useEffect( () => {

        // se alguma id for passada como parâmetro na URL
        // definirá que é um cadastro para ser editado
        let queryId = router.query.id
        /*
        if ( queryId && state.cadastros[ queryId ] ) {
            setCadastro( state.cadastros[ queryId ] )
            setEditado( state.cadastros[ queryId ] )
        }
        */

        setLoad( false )
    }, [ router.query ] )

    // volta o valor do cadastro editado para o padrão
    useEffect( () => {
        if ( !rollback ) return
        setEditado( JSON.parse( JSON.stringify( cadastro ) ) )
        setRollback( false )
    }, [ rollback ] )

    function setLoad ( valor ) {
        if ( typeof valor !== 'boolean' ) throw new Error( 'Valor para "Load" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setLoad', payload: valor } )
    }

    function setInAtendimentos ( cadastro ) {
        console.log( state.atendimentos )
        //dispatch( { type: 'setCadastros', payload: { ...state.cadastros, [ cadastro.id ]: cadastro } } )
    }

    async function salvarCadastro () {

        let aviso = Notification.notificate( 'Aviso', 'Salvando dados, aguarde...', 'info' )

        Database.salvarAtendimento( state.usuario, editado ).then( () => {
            Notification.removeNotification( aviso )
            Notification.notificate( 'Sucesso', 'Todos os dados foram salvos!', 'success' )
            // depois que salvou atualiza os dados localmente
            setCadastro( editado )
            setInAtendimentos( editado )

            // se tiver algum id na url até aqui é sinal que é uma edição de cadastro não um cadastro novo
            // ou seja, não precisa reenviar os dados da url pois eles já estão lá
            if ( router.query.id ) return
            // como é um cadastro novo o stack é a própria página de cadastro
            let paginaAtual = router.pathname.replace( '/', '' )
            router.push( {
                pathname: paginaAtual,
                query: {
                    stack: 'cadastroatendimento',
                    id: editado.id
                }
            } )

        } ).catch( err => {
            Notification.removeNotification( aviso )
            console.error( err )
            Notification.notificate( 'Erro', 'Tivemos um problema, tente novamente!', 'danger' )
        } )
    }

    function fechar () {
        let paginaAtual = router.pathname.replace( '/', '' )
        setLoad( true )

        // se esse componente estiver em stack em cima de outro componente
        // fecha esse componente e volta pro anterior
        if ( router.query.stack !== 'cadastroatendimento' && router.query.stack1 === 'cadastroatendimento' )
            return setTimeout( () => {
                router.push( {
                    pathname: paginaAtual,
                    query: {
                        stack: router.query.stack,
                        id: router.query.id,
                        data: router.query.data
                    }
                } )
            }, [ 200 ] )

        setTimeout( () => {
            router.push( paginaAtual )
        }, [ 200 ] )
    }

    function compareParentData () {
        if ( !cadastro ) return false
        return JSON.stringify( editado ) != JSON.stringify( cadastro )
    }

    return (
        <S.Container expandido={ expandido } sempreVisivel={ sempreVisivel }>
            <Header />
            <S.View>
                <S.Botoes>
                    { compareParentData() && <S.Botao onClick={ () => setRollback( true ) } hover={ colors.azul } title='Desfazer'> <MenuIcon name='desfazer' margin='0.8' /> </S.Botao> }
                    { compareParentData() && <S.Botao onClick={ () => salvarCadastro() } hover={ colors.azul } title='Salvar'> <MenuIcon name='salvar' margin='0.8' /> </S.Botao> }
                    <S.Botao onClick={ () => fechar() } hover={ colors.azul } title='Fechar'> <MenuIcon name='fechar' margin='0.8' /> </S.Botao>
                </S.Botoes>
                <S.TituloContainer>
                    <S.Titulo> Cadastrar Atendimento </S.Titulo>
                </S.TituloContainer>

            </S.View>
        </S.Container>
    )
}

export default Expandido