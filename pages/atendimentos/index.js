import { useState, useEffect } from 'react'
import axios from 'axios'

import * as S from './styles'
import Header from '../../components/Header'
import DropDown from '../../components/Atendimentos/DropDown'
import Listagem from '../../components/Atendimentos/Listagem'

function Atendimentos ( props ) {

    const [ busca, setBusca ] = useState( '' )
    //variaveis de buscas do database
    const [ clientes, setClientes ] = useState( {} )
    const [ atendimentos, setAtendimentos ] = useState( { 'Tecnicos': {} } )
    const [ atendimentosFiltrados, setAtendimentosFiltrados ] = useState( { 'Tecnicos': {} } )

    useEffect( () => {
        getDatabaseData()
    }, [] )

    //quando for alterado o campo de busca, o sistema mostrará os dados correspondentes
    //se a busca for valida, irá filtrar localmente os dados
    //se limpar a busca, irá buscar novamente os dados no servidor
    useEffect( () => {
        if ( busca !== '' ) setAtendimentosFiltrados( filtrarAtendimentosPorBusca() )
        if ( busca === '' ) setAtendimentosFiltrados( atendimentos )
    }, [ busca, atendimentos ] )

    async function getDatabaseData () {
        let dbAtendimentos = await axios.get( '/api/getatendimentos' )
        setAtendimentos( dbAtendimentos.data )
        props.setLoad( false )
    }

    function filtrarAtendimentosPorBusca () {

        function limparString ( str ) {
            return str.toLowerCase().normalize( 'NFD' ).replace( /[\u0300-\u036f]/g, '' )
        }

        function compararString ( compare, str ) {
            if ( compare.indexOf( str ) > -1 ) return true
            return false
        }

        function comparar ( atendimento ) {
            if ( compararString( limparString( atendimento.cliente.nomefantasia ), filtro )
                || compararString( limparString( atendimento.cliente.razaosocial ), filtro )
                || compararString( atendimento.cliente.cpfcnpj, filtro )
                || compararString( atendimento.cliente.contato.email, filtro )
                || compararString( atendimento.cliente.contato.telefone, filtro )
                || compararString( atendimento.cliente.contato.celular, filtro ) ) return true
            return false
        }

        const filtro = limparString( busca )
        return () => {
            let filtrados = {
                'Em aberto': {},
                'Feitos': {},
                'Tecnicos': {}
            }

            //primeiro filtrar os atendimentos em aberto
            for ( let id in atendimentos[ 'Em aberto' ] ) {
                let atendimento = atendimentos[ 'Em aberto' ][ id ]
                if ( comparar( atendimento ) ) filtrados[ 'Em aberto' ] = { ...filtrados[ 'Em aberto' ], [ id ]: atendimento }
            }

            //depois filtrar os atendimentos feitos
            for ( let id in atendimentos[ 'Feitos' ] ) {
                let atendimento = atendimentos[ 'Feitos' ][ id ]
                if ( comparar( atendimento ) ) filtrados[ 'Feitos' ] = { ...filtrados[ 'Feitos' ], [ id ]: atendimento }
            }

            //depois filtra os dos tecnicos
            for ( let tecnico in atendimentos[ 'Tecnicos' ] ) {
                for ( let id in atendimentos[ 'Tecnicos' ][ tecnico ] ) {
                    let atendimento = atendimentos[ 'Tecnicos' ][ tecnico ][ id ]
                    if ( comparar( atendimento ) ) filtrados[ 'Tecnicos' ][ tecnico ] = { ...filtrados[ 'Tecnicos' ][ tecnico ], [ id ]: atendimento }
                }
            }
            return filtrados
        }
    }

    return (
        <S.Container expanded={ props.expanded } desktop={ props.desktop }>
            <Header { ...props }>
                <DropDown { ...{ busca, setBusca } } />
            </Header>
            <S.View>
                {//lista primeiro os em aberto
                    <Listagem tecnico={ 'Em aberto' } expandido={ true } atendimentos={ atendimentosFiltrados[ 'Em aberto' ] } /> }

                { Object.keys( atendimentosFiltrados[ 'Tecnicos' ] ).map( tecnico =>
                    <Listagem key={ tecnico } tecnico={ tecnico } expandido={ true } draggable={ true } atendimentos={ atendimentosFiltrados[ 'Tecnicos' ][ tecnico ] } /> ) }

                {//por fim lista os feitos
                    <Listagem tecnico={ 'Feitos' } feitos={ true } atendimentos={ atendimentosFiltrados[ 'Feitos' ] } /> }
            </S.View>
        </S.Container>
    )
}

export default Atendimentos