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
    const { atendimentos, menu, cadastros, tecnicos, suprimentos } = state
    // variaveis sobre a visibilidade do menu lateral
    const { expandido, sempreVisivel } = menu
    // data atual
    const data = new Date()
    const timestamp = { _seconds: data.getTime() / 1000, _nanoseconds: data.getTime() }
    // atendimento com todos os dados limpos
    const limpo = { chave: data.getTime(), cliente: undefined, feito: false, motivo: [ '' ], responsavel: '', dados: { inicio: timestamp, ultimaalteracao: timestamp } }
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
    // opções de status de atendimento
    const statusAtendimento = [ { label: 'Em aberto', value: false }, { label: 'Finalizado', value: true } ]
    // controla se terá entrega de suprimentos
    const [ entregaSuprimentos, setEntregaSuprimentos ] = useState( false )
    // lista de suprimentos a ser adicionada nos motivos do atendimento
    const [ listaSuprimentos, setListaSuprimentos ] = useState( {} )
    const [ suprimentosDisponiveis, setSuprimentosDisponiveis ] = useState( JSON.parse( JSON.stringify( suprimentos ) ) )

    // quando iniciar o sistema
    useEffect( () => {

        if ( !router.query.chave || !state.atendimentos ) return
        // se alguma id for passada como parâmetro na URL
        // definirá que é um cadastro para ser editado
        let localizado = localizarAtendimento( router.query.chave )
        if ( !localizado ) return
        setCadastro( JSON.parse( JSON.stringify( localizado ) ) )
        setEditado( JSON.parse( JSON.stringify( localizado ) ) )

        setLoad( false )
    }, [ router.query, state.atendimentos ] )

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
        setListaSuprimentos( {} )
        setEntregaSuprimentos( false )

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

    useEffect( () => {

        if ( listaSuprimentos.length > 0 ) return
        if ( !entregaSuprimentos ) return setListaSuprimentos( {} )

        // pega o primeiro suprimento disponível na lista e define ele como o suprimento padrão
        let primeiroSuprimentoDisponivel = suprimentosDisponiveis[ Object.keys( suprimentosDisponiveis )[ 0 ] ]

        let suprimento = {
            value: primeiroSuprimentoDisponivel.value,
            label: primeiroSuprimentoDisponivel.label,
            quantidade: 1,
            id: Object.keys( suprimentos )[ 0 ]
        }
        // como é o primeiro suprimento adicionado na lista pode simplesmente definir ela
        setListaSuprimentos( { [ suprimento.id ]: suprimento } )
    }, [ entregaSuprimentos ] )

    useEffect( () => {
        atualiarSuprimentosDisponiveis()
    }, [ listaSuprimentos ] )

    function setLoad ( valor ) {
        if ( typeof valor !== 'boolean' ) throw new Error( 'Valor para "Load" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setLoad', payload: valor } )
    }

    function setInAtendimentos ( cadastro ) {
        dispatch( { type: 'setCadastros', payload: { ...state.cadastros, [ cadastro.id ]: cadastro } } )
    }

    function localizarAtendimento ( id ) {
        let localizado = undefined

        if ( atendimentos[ 'Em aberto' ] && atendimentos[ 'Em aberto' ][ id ] ) return atendimentos[ 'Em aberto' ][ id ]
        if ( atendimentos[ 'Feitos' ] && atendimentos[ 'Feitos' ][ id ] ) return atendimentos[ 'Feitos' ][ id ]

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

    function editarCadastro ( id ) {
        let paginaAtual = router.pathname.replace( '/', '' )

        setLoad( true )
        setTimeout( () => {
            router.push( {
                pathname: paginaAtual,
                query: {
                    stack: router.query.stack,
                    stack1: 'cadastrocliente', id,
                    data: router.query.data,
                    chave: router.query.chave
                }
            } )
        }, 200 )
    }

    function compareParentData () {
        if ( entregaSuprimentos ) return true
        if ( !cadastro ) return false
        return JSON.stringify( editado ) != JSON.stringify( cadastro )
    }

    function handleBuscarCliente ( e ) {
        if ( editado.cliente ) setEditado( set( 'cliente', undefined, editado ) )
        if ( cliente ) setCliente( undefined )
        if ( !mostrarListaNomes ) setMostrarListaNomes( true )
        setBuscaCliente( e.target.value.toLowerCase() )
    }

    function handleFocusBusca ( mostrar ) {
        // não irá mostrar a lista se o atendimento já tiver um cliente definido...
        // ...caso alguém clique no campo de texto sem digitar nada
        // ou não irá esconder a lista se a busca for diferente de vazio
        if ( cliente || ( !mostrar && buscaCliente ) !== '' ) return
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

        if ( views.length <= 0 ) return setMostrarListaNomes( false )
        return views
    }

    function handleResponsavelChange ( e ) {
        setEditado( set( 'responsavel', e.target.value, editado ) )
    }

    function handleStatusChange ( e ) {
        if ( e.target.value === 'false' ) return setEditado( set( 'feito', false, editado ) )
        setEditado( set( 'feito', true, editado ) )
    }

    function renderMotivos () {
        let views = []

        for ( let index in editado.motivo ) {
            views.push(
                <S.SobLinha key={ index }>
                    <S.Linha minWidth={ '140px' } maxWidth={ '100%' }>
                        <SimpleTextField onChange={ ( e ) => handleMotivoChange( e, index ) } value={ editado.motivo[ index ] } maxLength={ 50 } />
                    </S.Linha>

                    { editado.motivo.length != 1 && <>
                        <S.Spacer />
                        <S.Botao onClick={ () => removerMotivo( index ) } hover={ colors.azul } title='Remover motivo'> <MenuIcon name='fechar' margin='0' /> </S.Botao>
                    </> }
                </S.SobLinha>
            )
        }
        return views
    }

    function handleMotivoChange ( e, index ) {
        let motivos = [ ...editado.motivo ]
        motivos[ index ] = e.target.value
        setEditado( set( 'motivo', motivos, editado ) )
    }

    function removerMotivo ( index ) {
        let motivos = [ ...editado.motivo ]
        motivos.splice( index, 1 )
        setEditado( set( 'motivo', motivos, editado ) )
    }

    function adicionarMotivo () {
        let motivos = [ ...editado.motivo ]
        motivos.push( '' )
        setEditado( set( 'motivo', motivos, editado ) )
    }

    function renderListaSuprimentos () {
        let views = []

        function converterArray ( lista ) {
            let array = []

            for ( let id in lista ) {
                let item = lista[ id ]
                array.push( item )
            }
            return array
        }

        for ( let index in listaSuprimentos ) {
            let suprimento = listaSuprimentos[ index ]

            views.push(
                <S.SobLinha key={ index }>
                    <S.Linha minWidth={ '140px' } maxWidth={ '100%' } forceHover={ true }>
                        <S.SubTitulo> Modelo </S.SubTitulo>
                        <Select valor={ suprimento.value } options={ converterArray( suprimentos ) } onChange={ ( e ) => selecionarSuprimento( e.target.value, index ) } />
                    </S.Linha>

                    <S.Spacer />

                    <S.Linha minWidth={ '84px' } maxWidth={ '84px' } forceHover={ true }>
                        <TextField placeholder={ 'Quantidade' } onBlur={ ( e ) => handleQuantidadeBlur( e.target.value, index ) } onChange={ ( e ) => handleQuantidadeChange( e.target.value, index ) } value={ suprimento.quantidade } icon={ false } maxLength={ 2 } />
                    </S.Linha>

                    { Object.keys( listaSuprimentos ).length != 1 && <>
                        <S.Spacer />
                        <S.Botao onClick={ () => removerSuprimento( index ) } hover={ colors.azul } title='Remover suprimento'> <MenuIcon name='fechar' margin='0' /> </S.Botao>
                    </> }
                </S.SobLinha >

            )
        }
        return views
    }

    function selecionarSuprimento ( id, idVelha ) {

        let lista = { ...listaSuprimentos }
        delete lista[ idVelha ]
        lista[ id ] = {
            value: suprimentos[ id ].value,
            label: suprimentos[ id ].label,
            quantidade: 1, id
        }
        setListaSuprimentos( { ...lista } )
        atualiarSuprimentosDisponiveis()
    }

    function handleQuantidadeChange ( value, index ) {
        if ( isNaN( value ) ) return
        let lista = { ...listaSuprimentos }
        let suprimento = lista[ index ]

        suprimento.quantidade = value
        // se a quantidade digitada for maior que o estoque definie que a quantidade será o estoque todo
        if ( value > suprimentos[ suprimento.value ].estoque ) suprimento.quantidade = suprimentos[ suprimento.value ].estoque

        lista[ index ] = suprimento
        setListaSuprimentos( { ...lista } )
    }

    function handleQuantidadeBlur ( value, index ) {
        if ( isNaN( value ) ) return
        let lista = { ...listaSuprimentos }
        let suprimento = lista[ index ]

        suprimento.quantidade = value
        if ( value <= 0 || value === '' ) suprimento.quantidade = 1

        lista[ index ] = suprimento
        setListaSuprimentos( { ...lista } )
    }

    function removerSuprimento ( id ) {
        let lista = { ...listaSuprimentos }
        delete lista[ id ]
        setListaSuprimentos( lista )
    }

    function adicionarSuprimento () {

        // pega o primeiro suprimento disponível na lista e define ele como o suprimento padrão
        let primeiroSuprimentoDisponivel = suprimentosDisponiveis[ Object.keys( suprimentosDisponiveis )[ 0 ] ]

        let suprimento = {
            value: primeiroSuprimentoDisponivel.value,
            label: primeiroSuprimentoDisponivel.label,
            quantidade: 1,
            id: Object.keys( suprimentosDisponiveis )[ 0 ]
        }
        // atualiza a lista
        setListaSuprimentos( { ...listaSuprimentos, [ suprimento.id ]: suprimento } )
    }

    function atualiarSuprimentosDisponiveis () {
        let disponiveis = JSON.parse( JSON.stringify( suprimentos ) )
        for ( let index in listaSuprimentos ) {
            delete disponiveis[ index ]
        }
        setSuprimentosDisponiveis( disponiveis )
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
                    <S.Titulo> { router.query.chave ? 'Editar' : 'Novo' } Atendimento </S.Titulo>
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
                                { cliente && buscaCliente === cliente.nomefantasia && <S.Botao onClick={ () => editarCadastro( cliente.id ) } hover={ colors.azul } title='Editar Cliente' marginLeft={ '0.8' }> <MenuIcon name='usuario_editar' margin='0' /> </S.Botao> }
                            </S.Linha>
                            { buscaCliente !== '' && mostrarListaNomes && <S.ListaNomes>
                                { renderListaNomes() }
                            </S.ListaNomes> }
                        </S.ListaNomesContainer>

                        { cliente && buscaCliente === cliente.nomefantasia && <S.DadosCliente>
                            <S.ContainerDadoCliente>
                                <S.TextoDadoCliente><span>Endereço: </span>{ `${ endereco.rua }, ${ endereco.numero }, ${ endereco.complemento !== '' ? `${ endereco.complemento }, ` : '' } ${ endereco.cidade }, ${ endereco.estado }` }</S.TextoDadoCliente>

                                <S.SubContainerDadoCliente>
                                    { cliente.contato.telefone && <S.TextoDadoCliente><span>Telefone: </span>{ cliente.contato.telefone }</S.TextoDadoCliente> }

                                    { cliente.contato.telefone && cliente.contato.celular && <S.Separador border={ cliente.contato.telefone ? true : false } /> }
                                    { cliente.contato.celular && <S.TextoDadoCliente >
                                        <span>Celular: </span>{ cliente.contato.celular }</S.TextoDadoCliente> }
                                </S.SubContainerDadoCliente>
                                <S.SubContainerDadoCliente>
                                    <S.TextoDadoCliente><span>Chave do cadastro: </span>{ cliente.id }</S.TextoDadoCliente>
                                    { cliente.tipo == 'locacao' && <>
                                        <S.Separador border={ true } />
                                        <S.TextoDadoCliente><span>Versão do coletor: </span>{ cliente.sistema.versao }</S.TextoDadoCliente>
                                        <S.Separador border={ true } />
                                        <S.TextoDadoCliente><span>PC com coletor: </span>{ window.atob( cliente.sistema.local ) }</S.TextoDadoCliente> </> }
                                </S.SubContainerDadoCliente>
                            </S.ContainerDadoCliente>
                        </S.DadosCliente> }
                    </S.LinhaSubContainer>

                    <S.VerticalSpacer />

                    <S.LinhaSubContainer>
                        <S.SobLinha>

                            <S.Linha minWidth={ '140px' } maxWidth={ '100%' } forceHover={ true }>
                                <S.SubTitulo> Responsável </S.SubTitulo>
                                <Select valor={ editado.responsavel } options={ tecnicos } onChange={ handleResponsavelChange } />
                            </S.Linha>

                            <S.Spacer />

                            <S.Linha minWidth={ '140px' } maxWidth={ '250px' } forceHover={ true }>
                                <S.SubTitulo> Status </S.SubTitulo>
                                <Select valor={ editado.feito } options={ statusAtendimento } onChange={ handleStatusChange } />
                            </S.Linha>

                        </S.SobLinha>
                    </S.LinhaSubContainer>
                </S.LinhaContainer>

                <S.TituloContainer>
                    <S.Titulo> Motivos </S.Titulo>
                </S.TituloContainer>

                <S.LinhaContainer>

                    <S.LinhaSubContainer>
                        <S.LinhaSubContainer>
                            { renderMotivos() }
                            <S.VerticalSpacer />
                            { editado.motivo[ editado.motivo.length - 1 ] != '' && <S.Botao onClick={ () => adicionarMotivo() } hover={ colors.azul } title='Adicionar motivo'> <MenuIcon name='add' margin='0' /> </S.Botao> }
                        </S.LinhaSubContainer>
                    </S.LinhaSubContainer>
                </S.LinhaContainer>

                <S.TituloContainer>
                    <S.Titulo> Suprimentos </S.Titulo>
                </S.TituloContainer>

                <S.LinhaContainer>
                    <S.Linha>
                        <Checkbox text={ 'Entregar toners?' } changeReturn={ ( checked ) => setEntregaSuprimentos( checked ) } checked={ entregaSuprimentos } paddingLeft={ '0' } />
                    </S.Linha>
                    { entregaSuprimentos && <S.LinhaSubContainer>
                        { renderListaSuprimentos() }

                        { Object.keys( suprimentosDisponiveis ).length > 0 && <S.Linha>
                            <S.Botao onClick={ () => adicionarSuprimento() } hover={ colors.azul } title='Adicionar suprimento'> <MenuIcon name='add' margin='0' /> </S.Botao>
                        </S.Linha> }
                    </S.LinhaSubContainer> }
                </S.LinhaContainer>
            </S.View>
        </S.Container >
    )
}

export default AtendimentoExpandido