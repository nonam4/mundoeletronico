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

function AtendimentoExpandido () {
    // variaveis do contexto, disponível em todo o sistema
    const { state, dispatch } = useDados()
    // cores do tema
    const { colors } = useContext( ThemeContext )
    const router = useRouter()
    // variaveis disponíveis no contexto
    const { atendimentos, menu, cadastros } = state
    // variaveis sobre a visibilidade do menu lateral
    const { expandido, sempreVisivel } = menu
    // data atual
    const data = new Date()
    const timestamp = { _seconds: data.getTime() / 1000, _nanoseconds: data.getTime() }
    // atendimento com todos os dados limpos
    const limpo = { id: data.getTime(), cliente: undefined, feito: false, motivo: [], responsavel: '', dados: { inicio: timestamp, ultimaalteracao: timestamp } }
    // decide se vai voltar os dados para o padrão e desfazer as alterações
    const [ rollback, setRollback ] = useState( false )
    // valor padrão do cadastro, usado apenas para comparar para desfazer alterações
    const [ cadastro, setCadastro ] = useState( limpo )
    // cadastro sendo editado no momento
    const [ editado, setEditado ] = useState( limpo ) //somente o cadastro editado
    // variaveis referente ao cliente do atendimento
    const [ cliente, setCliente ] = useState( undefined )
    const [ endereco, setEndereco ] = useState( undefined )
    // controla a busca de clientes na lista quando for criar um atendimento
    const [ buscaCliente, setBuscaCliente ] = useState( '' )
    // controla se deve mostrar a lista de nomes ao buscar cadastros
    const [ mostrarListaNomes, setMostrarListaNomes ] = useState( false )

    // quando iniciar o sistema
    useEffect( () => {

        // se alguma id for passada como parâmetro na URL
        // definirá que é um cadastro para ser editado
        let queryId = router.query.id
        if ( queryId ) {
            let localizado = localizarAtendimento( queryId )

            if ( !localizado ) return
            setCadastro( JSON.parse( JSON.stringify( localizado ) ) )
            setEditado( JSON.parse( JSON.stringify( localizado ) ) )
        }

        setLoad( false )
    }, [ router.query ] )

    useEffect( () => {
        if ( buscaCliente === '' ) return

    }, [ buscaCliente ] )

    // volta o valor do cadastro editado para o padrão
    useEffect( () => {
        if ( !rollback ) return

        setEditado( JSON.parse( JSON.stringify( cadastro ) ) )
        setBuscaCliente( '' )
        setCliente( undefined )
        setEndereco( undefined )

        setRollback( false )
    }, [ rollback ] )

    useEffect( () => {
        if ( !editado.cliente ) return
        let dados = cadastros[ editado.cliente.tipo ][ editado.cliente.id ]
        // se o cliente não existir mais (por ser excluido por exemplo)
        if ( !dados ) {
            Notification.notificate( 'Erro', 'O cliente do atendimento não existe!', 'danger' )
            fechar()
            return
        }

        setCliente( dados )
        setBuscaCliente( dados.nomefantasia )
        setEndereco( dados.endereco )
    }, [ editado ] )

    function setLoad ( valor ) {
        if ( typeof valor !== 'boolean' ) throw new Error( 'Valor para "Load" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setLoad', payload: valor } )
    }

    function setInAtendimentos ( cadastro ) {
        dispatch( { type: 'setCadastros', payload: { ...state.cadastros, [ cadastro.id ]: cadastro } } )
    }

    function localizarAtendimento ( id ) {
        let localizado = undefined

        if ( atendimentos[ 'Em aberto' ][ id ] ) return atendimentos[ 'Em aberto' ][ id ]
        if ( atendimentos[ 'Feitos' ][ id ] ) return atendimentos[ 'Feitos' ][ id ]

        //depois filtra os dos tecnicos
        for ( let tecnico in atendimentos[ 'Tecnicos' ] ) {
            if ( atendimentos[ 'Tecnicos' ][ tecnico ][ id ] ) localizado = atendimentos[ 'Tecnicos' ][ tecnico ][ id ]
        }

        return localizado
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

    function handleBuscarCliente ( e ) {
        setBuscaCliente( e.target.value.toLowerCase() )
    }

    function handleFocusBusca ( mostrar ) {
        // não irá esconder a lista se a busca for diferente de vazio
        if ( !mostrar && buscaCliente !== '' ) return
        setMostrarListaNomes( mostrar )
    }

    function setClienteAtendimento ( { id, tipo, nomefantasia } ) {
        setMostrarListaNomes( false )
        setBuscaCliente( nomefantasia )
        setEditado( set( 'cliente', { id, tipo }, editado ) )
    }

    function renderListaNomes () {
        let views = []

        function compare ( nome ) {
            let busca = buscaCliente.normalize( 'NFD' ).replace( /[^a-zA-Zs]/g, '' )
            // somente precisa definir o nome como lowercase pois a busca sempre será
            // remove todas as pontuações na hora da comparação
            return nome.toLowerCase().normalize( 'NFD' ).replace( /[^a-zA-Zs]/g, '' ).indexOf( busca ) > -1
        }

        for ( let tipo in cadastros ) {
            for ( let id in cadastros[ tipo ] ) {

                let cadastro = cadastros[ tipo ][ id ]
                let nome = undefined

                if ( compare( cadastro.razaosocial ) ) nome = cadastro.razaosocial
                if ( compare( cadastro.nomefantasia ) ) nome = cadastro.nomefantasia

                if ( nome ) views.push( <S.ItemListaNomes key={ cadastro.id } onClick={ () => setClienteAtendimento( cadastro ) }> { nome } </S.ItemListaNomes> )
            }
        }

        return views
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
                    <S.Titulo> { router.query.id ? 'Editar' : 'Novo' } Atendimento </S.Titulo>
                    <div>
                        <S.DadosCadastro>ID do atendimento: <b> { editado.id } </b></S.DadosCadastro>
                        <S.DadosCadastro>Data do cadastro: <b> { Database.convertTimestamp( editado.dados.inicio ) } </b></S.DadosCadastro>
                        <S.DadosCadastro>Última alteração: <b>  { Database.convertTimestamp( editado.dados.ultimaalteracao ) } </b></S.DadosCadastro>
                    </div>
                </S.TituloContainer>

                <S.LinhaContainer>
                    <S.LinhaSubContainer>
                        <S.ListaNomesContainer >
                            <S.Linha>
                                <TextField placeholder={ 'Cliente' } onFocus={ () => handleFocusBusca( true ) } onBlur={ () => handleFocusBusca( false ) } onChange={ ( e ) => handleBuscarCliente( e ) } value={ buscaCliente } icon={ false } maxLength={ 50 } />
                            </S.Linha>
                            { buscaCliente !== '' && mostrarListaNomes && <S.ListaNomes>
                                { renderListaNomes() }
                            </S.ListaNomes> }
                        </S.ListaNomesContainer>
                        { cliente && <S.DadosCliente>

                            <S.ContainerDadoCliente>
                                <S.TituloDadoCliente> Endereço </S.TituloDadoCliente>
                                <S.TextoDadoCliente>{ `${ endereco.rua }, ${ endereco.numero }, ${ endereco.complemento !== '' ? `${ endereco.complemento }, ` : '' } ${ endereco.cidade }, ${ endereco.estado }` }</S.TextoDadoCliente>
                            </S.ContainerDadoCliente>

                            <S.ContainerDadoCliente>
                                <S.TituloDadoCliente> Contato </S.TituloDadoCliente>
                                <S.TextoDadoCliente>{ `${ cliente.contato.telefone } - ${ cliente.contato.celular }` }</S.TextoDadoCliente>
                            </S.ContainerDadoCliente>

                            <S.SubcontainerDadoCliente>

                                <S.ContainerDadoCliente>
                                    <S.TituloDadoCliente> Chave do cliente </S.TituloDadoCliente>
                                    <S.TextoDadoCliente>{ cliente.id }</S.TextoDadoCliente>
                                </S.ContainerDadoCliente>

                                <S.ContainerDadoCliente>
                                    <S.TituloDadoCliente> Versão do coletor </S.TituloDadoCliente>
                                    <S.TextoDadoCliente>{ cliente.sistema.versao }</S.TextoDadoCliente>
                                </S.ContainerDadoCliente>

                                <S.ContainerDadoCliente>
                                    <S.TituloDadoCliente> PC com coletor </S.TituloDadoCliente>
                                    <S.TextoDadoCliente>{ window.atob( cliente.sistema.local ) }</S.TextoDadoCliente>
                                </S.ContainerDadoCliente>

                            </S.SubcontainerDadoCliente>

                        </S.DadosCliente> }
                    </S.LinhaSubContainer>
                </S.LinhaContainer>

            </S.View>
        </S.Container>
    )
}

export default AtendimentoExpandido