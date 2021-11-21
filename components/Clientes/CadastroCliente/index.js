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
    // ultimo horário usado quando definindo horários, começa com valor padrão
    const [ ultimoHorarioUsado, setUltimoHorarioUsado ] = useState( { 0: '08:00', 1: '12:00', 2: '13:30', 3: '18:00' } )
    // dias da semana
    const dias = [ { nome: 'Segunda', index: 'segunda' }, { nome: 'Terça', index: 'terca' }, { nome: 'Quarta', index: 'quarta' },
    { nome: 'Quinta', index: 'quinta' }, { nome: 'Sexta', index: 'sexta' }, { nome: 'Sábado', index: 'sabado' } ]
    // opções de tipo de cadastro
    const tiposCadastro = [ { label: 'Locação', value: 'locacao' }, { label: 'TI / Particular', value: 'particular' }, { label: 'Fornecedor', value: 'fornecedor' } ]
    // cliente com todos os dados limpos, local: 'Ti9J' é local: 'N/I' já codificado em base64
    const limpo = {
        id: data.getTime(), nomefantasia: '', razaosocial: '', cpfcnpj: '', endereco: {
            rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: ''
        }, contato: { email: '', telefone: '', celular: '' },
        horarios: { segunda: { aberto: false }, terca: { aberto: false }, quarta: { aberto: false }, quinta: { aberto: false }, sexta: { aberto: false }, sabado: { aberto: false } },
        sistema: { local: 'Ti9J', versao: 'N/I' }, tipo: 'locacao'
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
        if ( queryId && state.cadastros[ queryId ] ) {
            setCadastro( state.cadastros[ queryId ] )
            setEditado( state.cadastros[ queryId ] )
        }

        setLoad( false )
    }, [ router.query ] )

    // se o valor padrão do cadastro mudar, propaga para o cadastro editado
    useEffect( () => {
        if ( cadastro ) setEditado( JSON.parse( JSON.stringify( cadastro ) ) )
    }, [ cadastro ] )

    // volta o valor do cadastro editado para o padrão
    useEffect( () => {
        if ( !rollback ) return
        setEditado( JSON.parse( JSON.stringify( cadastro ) ) )
        setUltimoHorarioUsado( { 0: '08:00', 1: '12:00', 2: '13:30', 3: '18:00' } )
        setRollback( false )
    }, [ rollback ] )

    function setLoad ( valor ) {
        if ( typeof valor !== 'boolean' ) throw new Error( 'Valor para "Load" deve ser TRUE ou FALSE' )
        dispatch( { type: 'setLoad', payload: valor } )
    }

    function fechar () {
        let paginaAtual = router.pathname.replace( '/', '' )
        setLoad( true )

        // se esse componente estiver em stack em cima de outro componente
        // fecha esse componente e volta pro anterior
        if ( router.query.stack !== 'cadastrocliente' && router.query.stack1 === 'cadastrocliente' )
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

    async function salvarCadastro ( alterado ) {

        if ( editado.nomefantasia === '' || editado.nomefantasia.length < 5 ) return Notification.notificate( 'Erro', 'Nome fantasia em branco ou inválido!', 'danger' )
        if ( editado.razaosocial === '' || editado.razaosocial.length < 5 ) return Notification.notificate( 'Erro', 'Razão social em branco ou inválida!', 'danger' )
        if ( editado.cpfcnpj === '' || editado.cpfcnpj.length < 14 ) return Notification.notificate( 'Erro', 'CPF/CNPJ branco ou inválido!', 'danger' )
        if ( editado.contato.telefone === '' && editado.contato.celular === '' ) return Notification.notificate( 'Erro', 'Informe algum telefone ou celular!', 'danger' )
        if ( editado.contato.telefone !== '' && editado.contato.telefone.length < 14 ) return Notification.notificate( 'Erro', 'Telefone em branco ou inválido!', 'danger' )
        if ( editado.contato.celular !== '' && editado.contato.celular.length < 15 ) return Notification.notificate( 'Erro', 'Celular em branco ou inválido!', 'danger' )
        if ( editado.endereco.rua === '' || editado.endereco.rua.length < 5 ) return Notification.notificate( 'Erro', 'Endereço/Rua em branco ou inválido!', 'danger' )
        if ( editado.endereco.numero === '' ) return Notification.notificate( 'Erro', 'Endereço/Número em branco ou inválido!', 'danger' )
        if ( editado.endereco.cidade === '' || editado.endereco.cidade.length < 4 ) return Notification.notificate( 'Erro', 'Endereço/Cidade em branco ou inválido!', 'danger' )
        if ( editado.endereco.estado === '' || editado.endereco.estado.length < 2 ) return Notification.notificate( 'Erro', 'Endereço/Estado em branco ou inválido!', 'danger' )

        let aviso = Notification.notificate( 'Aviso', 'Salvando dados, aguarde...', 'info' )

        Database.salvarCadastro( state.usuario, alterado ).then( () => {
            Notification.removeNotification( aviso )
            Notification.notificate( 'Sucesso', 'Todos os dados foram salvos!', 'success' )
            // depois que salvou atualiza os dados localmente
            setCadastro( alterado )
            fechar()

        } ).catch( err => {
            Notification.removeNotification( aviso )
            console.error( err )
            Notification.notificate( 'Erro', 'Tivemos um problema, tente novamente!', 'danger' )
        } )
    }

    function compareParentData () {
        if ( !cadastro ) return false
        return JSON.stringify( editado ) != JSON.stringify( cadastro )
    }

    function handleInput ( e, campo ) {
        setEditado( set( campo, e.target.value, editado ) )
    }

    function modifyString ( input, positions, chars ) {
        let string = input.split( '' ) //transforma a string em um array de letras
        for ( let [ i, pos ] of positions.entries() ) { //adiciona o array de caractéres nos indexes desejados
            string.splice( pos, 0, chars[ i ] )
        }
        return string.join( '' ) //devolve de volta em string novamente
    }

    function handleTipoClienteChange ( e ) {
        setEditado( set( 'tipo', e.target.value, editado ) )
    }

    function formatarCpfcnpj ( e, campo ) {

        function formatar ( input ) {
            //caso seja um cpf
            if ( input.length < 4 ) return input
            if ( input.length < 7 ) return modifyString( input, [ 3 ], [ '.' ] )
            if ( input.length < 10 ) return modifyString( input, [ 3, 7 ], [ '.', '.' ] )
            if ( input.length < 12 ) return modifyString( input, [ 3, 7, 11 ], [ '.', '.', '-' ] )
            //caso seja um cnpj
            if ( input.length < 13 ) return modifyString( input, [ 2, 6, 10 ], [ '.', '.', '/' ] )
            return modifyString( input, [ 2, 6, 10, 15 ], [ '.', '.', '/', '-' ] )
        }

        let text = e.target.value.replace( /-|\/|\./g, '' ) //faz o replace de traços, barras para frente e pontos
        if ( !isNaN( text ) && text.length < 15 ) return setEditado( set( campo, formatar( text ), editado ) )
    }

    function formatarTelefone ( e, campo ) {

        function formatar ( input ) {
            if ( input.length == 0 ) return input

            if ( input.length < 3 ) return modifyString( input, [ 0 ], [ '(' ] )
            if ( input.length < 7 ) return modifyString( input, [ 0, 3 ], [ '(', ') ' ] )
            return modifyString( input, [ 0, 3, 8 ], [ '(', ') ', '-' ] )
        }

        let text = e.target.value.replace( /\(|\)|\-|\s/g, '' ) //faz o replace de parenteses, traços e espaços vazios
        if ( !isNaN( text ) && text.length < 11 ) return setEditado( set( campo, formatar( text ), editado ) )
    }

    function formatarCelular ( e, campo ) {

        function formatar ( input ) {
            if ( input.length == 0 ) return input

            if ( input.length < 3 ) return modifyString( input, [ 0 ], [ '(' ] )
            if ( input.length < 8 ) return modifyString( input, [ 0, 3 ], [ '(', ') ' ] )
            return modifyString( input, [ 0, 3, 9 ], [ '(', ') ', '-' ] )
        }

        let text = e.target.value.replace( /\(|\)|\-|\s/g, '' ) //faz o replace de parenteses, traços e espaços vazios
        if ( !isNaN( text ) && text.length < 12 ) return setEditado( set( campo, formatar( text ), editado ) )
    }

    function formatarNumero ( e, campo ) {
        if ( !isNaN( e.target.value ) ) return setEditado( set( campo, e.target.value, editado ) )
    }

    function formatarCep ( e, campo ) {

        function formatar ( input ) {
            if ( input.length < 6 ) return input
            return modifyString( input, [ 5 ], [ '-' ] )
        }

        let text = e.target.value.replace( /\-/g, '' ) //faz o replace de traços
        if ( !isNaN( text ) && text.length < 9 ) return setEditado( set( campo, formatar( text ), editado ) )
    }

    function formatarEstado ( e, campo ) {
        let text = e.target.value.replace( /[^A-Za-z\s!?]|\s/g, '' ) //remove tudo exceto letras
        if ( isNaN( text ) || text == 0 ) return setEditado( set( campo, text.toUpperCase(), editado ) )
    }

    function setHorarioAberto ( dia ) {
        setEditado( set( `horarios.${ dia }.aberto`, !editado.horarios[ dia ].aberto, editado ) )
    }

    function getHorario ( dia, index ) {

        if ( !editado.horarios[ dia ].horarios || editado.horarios[ dia ].horarios[ index ] === undefined ) setEditado( set( `horarios.${ dia }.horarios.${ index }`, ultimoHorarioUsado[ index ], editado ) )
        if ( !editado.horarios[ dia ].horarios || editado.horarios[ dia ].horarios[ index ] === undefined ) return ultimoHorarioUsado[ index ]
        return editado.horarios[ dia ].horarios[ index ]
    }

    function handleHorarioChange ( e, dia, index ) {
        let input = e.target.value.replace( ':', '' )
        let a, b

        if ( isNaN( input ) ) return

        if ( input === '' ) return setEditado( set( `horarios.${ dia }.horarios.${ index }`, ' ', editado ) )
        //se estiver apenas os dois primeiros numeros e eles forem maiores que 23 definirá como 23
        if ( Number( input ) > 23 && input.length === 2 ) return setEditado( set( `horarios.${ dia }.horarios.${ index }`, '23', editado ) )
        if ( input.length === 1 || input.length === 2 ) return setEditado( set( `horarios.${ dia }.horarios.${ index }`, input, editado ) )

        a = input.substring( 0, 2 )
        b = input.substring( 2, 4 )
        if ( Number( a ) > 23 ) a = '23'
        if ( Number( b ) > 5 ) b = '59'
        if ( input.length === 3 ) return setEditado( set( `horarios.${ dia }.horarios.${ index }`, `${ a }:${ b }`, editado ) )

        a = input.substring( 0, 2 )
        b = input.substring( 2, 5 )
        if ( Number( a ) > 23 ) a = '23'
        if ( Number( b ) > 59 ) b = '59'
        setEditado( set( `horarios.${ dia }.horarios.${ index }`, `${ a }:${ b }`, editado ) )
    }

    function handleBlurHorario ( dia, index ) {
        let horario = editado.horarios[ dia ].horarios[ index ].replace( ':', '' )
        let a, b

        setUltimoHorarioUsado( { ...ultimoHorarioUsado, [ `${ index }` ]: '' } )
        if ( horario === '' || horario === ' ' ) return setEditado( set( `horarios.${ dia }.horarios.${ index }`, '', editado ) )
        setUltimoHorarioUsado( { ...ultimoHorarioUsado, [ `${ index }` ]: `0${ horario }:00` } )
        if ( horario.length === 1 ) return setEditado( set( `horarios.${ dia }.horarios.${ index }`, `0${ horario }:00`, editado ) )
        setUltimoHorarioUsado( { ...ultimoHorarioUsado, [ `${ index }` ]: '23:00' } )
        if ( horario.length === 2 && Number( horario ) > 23 ) return setEditado( set( `horarios.${ dia }.horarios.${ index }`, '23:00', editado ) )
        setUltimoHorarioUsado( { ...ultimoHorarioUsado, [ `${ index }` ]: `${ horario }:00` } )
        if ( horario.length === 2 ) return setEditado( set( `horarios.${ dia }.horarios.${ index }`, `${ horario }:00`, editado ) )

        a = horario.substring( 0, 2 )
        b = `${ horario.substring( 2, 4 ) }0`
        if ( Number( a ) > 23 ) a = '23'
        if ( Number( b ) > 59 ) b = '59'
        setUltimoHorarioUsado( { ...ultimoHorarioUsado, [ `${ index }` ]: `${ a }:${ b }` } )
        if ( horario.length === 3 ) return setEditado( set( `horarios.${ dia }.horarios.${ index }`, `${ a }:${ b }`, editado ) )

        a = horario.substring( 0, 2 )
        b = horario.substring( 2, 5 )
        if ( Number( a ) > 23 ) a = '23'
        if ( Number( b ) > 59 ) b = '59'
        setUltimoHorarioUsado( { ...ultimoHorarioUsado, [ `${ index }` ]: `${ a }:${ b }` } )
        setEditado( set( `horarios.${ dia }.horarios.${ index }`, `${ a }:${ b }`, editado ) )
    }

    function duasLinhasHorarios ( dia ) {
        if ( !editado.horarios[ dia ].horarios ) return true
        if ( editado.horarios[ dia ].horarios[ 2 ] === '' && editado.horarios[ dia ].horarios[ 3 ] === '' ) return false
        return true
    }

    function adicionarSegundaLinhaHorarios ( dia ) {
        let array = [ ...editado.horarios[ dia ].horarios ]
        array[ 2 ] = '13:30'
        array[ 3 ] = '18:00'
        setEditado( set( `horarios.${ dia }.horarios`, array, editado ) )
    }

    function renderDias () {
        let views = []
        for ( let dia of dias ) {
            views.push(
                <S.HorarioSubcontainer key={ dia.index }>
                    <Checkbox text={ dia.nome } changeReturn={ () => setHorarioAberto( dia.index ) } checked={ editado.horarios[ dia.index ].aberto } />
                    { editado.horarios[ dia.index ].aberto && <S.Horario>
                        <SimpleTextField onChange={ ( e ) => handleHorarioChange( e, dia.index, 0 ) } value={ getHorario( dia.index, 0 ) } maxLength={ 5 } onBlur={ () => handleBlurHorario( dia.index, 0 ) } />
                        <S.Spacer /> - <S.Spacer />
                        <SimpleTextField onChange={ ( e ) => handleHorarioChange( e, dia.index, 1 ) } value={ getHorario( dia.index, 1 ) } maxLength={ 5 } onBlur={ () => handleBlurHorario( dia.index, 1 ) } />
                    </S.Horario> }
                    { editado.horarios[ dia.index ].aberto && duasLinhasHorarios( dia.index ) && <S.Horario>
                        <SimpleTextField onChange={ ( e ) => handleHorarioChange( e, dia.index, 2 ) } value={ getHorario( dia.index, 2 ) } maxLength={ 5 } onBlur={ () => handleBlurHorario( dia.index, 2 ) } />
                        <S.Spacer /> - <S.Spacer />
                        <SimpleTextField onChange={ ( e ) => handleHorarioChange( e, dia.index, 3 ) } value={ getHorario( dia.index, 3 ) } maxLength={ 5 } onBlur={ () => handleBlurHorario( dia.index, 3 ) } />
                    </S.Horario> }
                    { editado.horarios[ dia.index ].aberto && !duasLinhasHorarios( dia.index ) && <S.Horario>
                        <S.Botao onClick={ () => adicionarSegundaLinhaHorarios( dia.index ) } hover={ colors.azul } title='Adicionar'> <MenuIcon name='arrow_dwn' margin='0' /> </S.Botao>
                    </S.Horario> }
                </S.HorarioSubcontainer>
            )
        }
        return views
    }

    return (
        <S.Container expandido={ expandido } sempreVisivel={ sempreVisivel }>
            <Header />
            <S.View>
                <S.Botoes>
                    { compareParentData() && <S.Botao onClick={ () => setRollback( true ) } hover={ colors.azul } title='Desfazer'> <MenuIcon name='desfazer' margin='0.8' /> </S.Botao> }
                    { compareParentData() && <S.Botao onClick={ () => salvarCadastro( editado ) } hover={ colors.azul } title='Salvar'> <MenuIcon name='salvar' margin='0.8' /> </S.Botao> }
                    <S.Botao onClick={ () => { fechar() } } hover={ colors.azul } title='Fechar'> <MenuIcon name='fechar' margin='0.8' /> </S.Botao>
                </S.Botoes>
                <S.TituloContainer>
                    <S.Titulo> Dados cadastrais </S.Titulo>
                    <div>
                        <S.DadosColetor>Chave do cliente: <b> { editado.id } </b></S.DadosColetor>
                        <S.DadosColetor>Pc com coletor: <b> { typeof window !== "undefined" && window.atob( editado.sistema.local ) } </b></S.DadosColetor>
                        <S.DadosColetor>Versão do coletor: <b>  { editado.sistema.versao } </b></S.DadosColetor>
                    </div>
                </S.TituloContainer>

                <S.LinhaContainer>
                    <S.LinhaSubContainer>
                        <S.SobLinha>
                            <S.Linha> <TextField placeholder={ 'Nome Fantasia' } onChange={ ( e ) => handleInput( e, 'nomefantasia' ) } value={ editado.nomefantasia } icon={ false } maxLength={ 50 } /> </S.Linha>
                            <S.Spacer />
                            <S.Linha minWidth={ '140px' } maxWidth={ '140px' } forceHover={ true }>
                                <S.SubTitulo> Tipo </S.SubTitulo>
                                <Select valor={ editado.tipo } options={ tiposCadastro } onChange={ handleTipoClienteChange } />
                            </S.Linha>
                        </S.SobLinha>
                        <S.Linha> <TextField placeholder={ 'Razão Social' } onChange={ ( e ) => handleInput( e, 'razaosocial' ) } value={ editado.razaosocial } icon={ false } maxLength={ 50 } /> </S.Linha>

                        <S.SobLinha>
                            <S.Linha minWidth={ '140px' } maxWidth={ '140px' }> <TextField placeholder={ 'CPF/CNPJ' } onChange={ ( e ) => formatarCpfcnpj( e, 'cpfcnpj' ) } value={ editado.cpfcnpj } icon={ false } /> </S.Linha>
                            <S.Spacer />
                            <S.Linha> <TextField placeholder={ 'Email' } onChange={ ( e ) => handleInput( e, 'contato.email' ) } value={ editado.contato.email } icon={ false } maxLength={ 50 } /> </S.Linha>
                        </S.SobLinha>

                        <S.SubLinha>
                            <S.Linha> <TextField placeholder={ 'Telefone' } onChange={ ( e ) => formatarTelefone( e, 'contato.telefone' ) } value={ editado.contato.telefone } icon={ false } /> </S.Linha>
                            <S.Spacer />
                            <S.Linha> <TextField placeholder={ 'Celular' } onChange={ ( e ) => formatarCelular( e, 'contato.celular' ) } value={ editado.contato.celular } icon={ false } /> </S.Linha>
                        </S.SubLinha>
                    </S.LinhaSubContainer>
                </S.LinhaContainer>

                <S.TituloContainer>
                    <S.Titulo> Endereço </S.Titulo>
                </S.TituloContainer>

                <S.LinhaContainer>
                    <S.LinhaSubContainer>
                        <S.SubLinha>
                            <S.Linha> <TextField placeholder={ 'Rua' } onChange={ ( e ) => handleInput( e, 'endereco.rua' ) } value={ editado.endereco.rua } icon={ false } maxLength={ 50 } /> </S.Linha>
                            <S.Spacer />
                            <S.Linha important={ true } minWidth={ '65px' } maxWidth={ '65px' }> <TextField placeholder={ 'Número' } onChange={ ( e ) => formatarNumero( e, 'endereco.numero' ) } value={ editado.endereco.numero } icon={ false } maxLength={ 5 } /> </S.Linha>
                        </S.SubLinha>

                        <S.SobLinha>
                            <S.Linha> <TextField placeholder={ 'Complemento' } onChange={ ( e ) => handleInput( e, 'endereco.complemento' ) } value={ editado.endereco.complemento } icon={ false } maxLength={ 100 } /> </S.Linha>
                        </S.SobLinha>

                        <S.SobLinha>
                            <S.Linha> <TextField placeholder={ 'Bairro' } onChange={ ( e ) => handleInput( e, 'endereco.bairro' ) } value={ editado.endereco.bairro } icon={ false } maxLength={ 50 } /> </S.Linha>
                            <S.Spacer />
                            <S.SubLinha margin={ '0' } maxWidth={ 'fit-content' }>
                                <S.Linha> <TextField placeholder={ 'Cidade' } onChange={ ( e ) => handleInput( e, 'endereco.cidade' ) } value={ editado.endereco.cidade } icon={ false } maxLength={ 50 } /> </S.Linha>
                                <S.Spacer />
                                <S.Linha important={ true } minWidth={ '38px' } maxWidth={ '38px' }> <TextField placeholder={ 'UF' } onChange={ ( e ) => formatarEstado( e, 'endereco.estado' ) } value={ editado.endereco.estado.toUpperCase() } icon={ false } maxLength={ 2 } /> </S.Linha>
                                <S.Spacer />
                                <S.Linha important={ true } minWidth={ '82px' } maxWidth={ '82px' }> <TextField placeholder={ 'CEP' } onChange={ ( e ) => formatarCep( e, 'endereco.cep' ) } value={ editado.endereco.cep } icon={ false } /> </S.Linha>
                            </S.SubLinha>
                        </S.SobLinha>
                    </S.LinhaSubContainer>
                </S.LinhaContainer>

                <S.TituloContainer>
                    <S.Titulo> Horários </S.Titulo>
                </S.TituloContainer>

                <S.HorarioContainer>
                    { renderDias() }
                </S.HorarioContainer>
            </S.View>
        </S.Container>
    )
}

export default Expandido