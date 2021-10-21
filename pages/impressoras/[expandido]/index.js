import { useState, useEffect, useContext, memo } from 'react'
import set from 'lodash/fp/set'
import { ThemeContext } from 'styled-components'
import { jsPDF } from 'jspdf'

import { bg, font } from '../../../hooks/useRelatorio'
import MenuIcon from '../../../components/Icons/MenuIcon'
import Select from '../../../components/Inputs/Select'
import TextField from '../../../components/Inputs/SimpleTextField'
import Impressoras from '../../../components/Impressoras/Expandido/Impressoras'

import * as S from './styles'

function Expandido ( props ) {
    //valor padrão do select de tipo de franquias
    const franquias = [ { label: 'Ilimitada', value: 'ilimitado' }, { label: 'Por página', value: 'pagina' }, { label: 'Por máquina', value: 'maquina' } ]
    //variaveis de controle de interface
    const { colors } = useContext( ThemeContext )
    const [ show, setShow ] = useState( false )
    const [ rollback, setRollback ] = useState( false )
    //valores alteráveis pelo usuário
    const [ cliente, setCliente ] = useState( JSON.parse( JSON.stringify( props.cliente ) ) )
    const [ franquiaPagina, setFranquiaPagina ] = useState( cliente.franquia.tipo === 'pagina' ? true : false )
    const [ valorFranquiaPagina, setValorFranquiaPagina ] = useState( `${ cliente.franquia.limite } págs` )
    const [ vpe, setVpe ] = useState( cliente.franquia.vpe === 0 ? 'R$ 0,00' : `R$ ${ String( cliente.franquia.vpe ).replace( '.', ',' ) }` )

    useEffect( () => {
        setShow( true )
    }, [] )

    useEffect( () => {
        setCliente( JSON.parse( JSON.stringify( props.cliente ) ) )
    }, [ props.cliente ] )

    useEffect( () => {
        if ( !rollback ) return

        setCliente( JSON.parse( JSON.stringify( props.cliente ) ) )
        setFranquiaPagina( props.cliente.franquia.tipo === 'pagina' ? true : false )
        setValorFranquiaPagina( `${ props.cliente.franquia.limite } págs` )
        setVpe( props.cliente.franquia.vpe === 0 ? 'R$ 0,00' : `R$ ${ String( props.cliente.franquia.vpe ).replace( '.', ',' ) }` )

        setRollback( false )
    }, [ rollback ] )

    function fechar () {
        setShow( false )
        setTimeout( () => {
            props.fecharExpandido()
        }, 500 )
    }

    function salvar () {
        props.salvarExpandido( cliente )
        fechar()
    }

    async function gerarRelatorio () {
        const data = props.filters.data
        const meses = {
            '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril', '05': 'Maio', '06': 'Junho',
            '07': 'Julho', '08': 'Agosto', '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
        }

        function getOffset ( text ) {
            return ( 210 - pdf.getStringUnitWidth( text ) * pdf.internal.getFontSize() / pdf.internal.scaleFactor ) / 2
        }

        function aumentarLinha ( pdf, atual, aumento ) {
            if ( atual < 276 ) return atual + aumento

            pdf.addPage()
            pdf.addImage( bg, 'PNG', 0, 0, 210, 297, undefined, 'FAST' )
            return 90
        }

        function escrever ( texto, linha, aumento, centralizado ) {

            let offset = centralizado ? getOffset( texto ) : 20
            //todo texto entre ** será deixado em verde
            texto.split( '**' ).map( ( text, index ) => {
                pdf.setTextColor( colors.verde )
                if ( index % 2 === 0 ) pdf.setTextColor( '#000' )

                pdf.text( text, offset, linha )
                offset = offset + pdf.getStringUnitWidth( text ) * pdf.internal.getFontSize() / pdf.internal.scaleFactor
            } )

            return aumentarLinha( pdf, linha, aumento )
        }

        let pdf = new jsPDF( 'p', 'mm', [ 297, 210 ], true )
        let linha = 87
        pdf.addFileToVFS( 'SegoeUI.ttf', font )
        pdf.addFont( 'SegoeUI.ttf', 'Segoe UI', 'normal' )

        pdf.addImage( bg, 'PNG', 0, 0, 210, 297, undefined, 'FAST' )
        pdf.setFontSize( 16 )
        pdf.text( getOffset( cliente.razaosocial ), 80, cliente.razaosocial )
        pdf.setFontSize( 14 )
        linha = escrever( `Relatório mensal de impressões - ${ meses[ data.split( '-' )[ 1 ] ] } de ${ data.split( '-' )[ 0 ] }`, linha, 6, true )
        pdf.setFontSize( 12 )

        switch ( cliente.franquia.tipo ) {
            case 'pagina':
                linha = escrever( `Franquia contratada: ${ cliente.franquia.limite } páginas - Impressões contabilizadas: ${ cliente.impresso } página${ cliente.impresso != 1 ? 's' : '' }`, linha, 5, true )
                pdf.setFontSize( 11 )
                linha = escrever( `Valor por excedente: ${ cliente.franquia.vpe.toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) } - Excedentes totais: ${ cliente.excedentes } página${ cliente.excedentes != 1 ? 's' : '' } - Valor dos excedentes: ${ ( cliente.franquia.vpe * cliente.excedentes ).toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) }`, linha, 5, true )
                pdf.setFontSize( 12 )
                break
            case 'maquina':
                linha = escrever( `Impressões contabilizadas: ${ cliente.impresso } páginas - Excedentes totais: ${ cliente.excedentes } página${ cliente.excedentes != 1 ? 's' : '' }`, linha, 5, true )
                linha = escrever( `Valor por excedente: ${ cliente.franquia.vpe.toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) } - Valor dos excedentes: ${ ( cliente.franquia.vpe * cliente.excedentes ).toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) }`, linha, 5, true )
                break
            case 'ilimitado':
                linha = escrever( `Impressões contabilizadas: ${ cliente.impresso } página${ cliente.impresso != 1 ? 's' : '' } - Valor por página: ${ cliente.franquia.vpe.toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) } - Valor total: ${ ( cliente.franquia.vpe * cliente.impresso ).toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) }`, linha, 5, true )
                break
        }

        linha = escrever( '', linha, 5 ) //adiciona espaço em branco
        for ( let serial in cliente.impressoras ) {
            let impressora = cliente.impressoras[ serial ]
            let contadores = impressora.contadores[ data ]

            if ( !impressora.contabilizar || impressora.substituida || !impressora ) continue
            //verifica se todas as informações da impressora caberão na mesma página
            //se a linha + (padrão 6 linhas por impressora) * (padrão 4 de aumento de linha) for maior que o limite da página ou
            //se a impressora tiver adicional de troca (a impressora for listada nas trocas) e 
            //a linha + (padrão 7 linhas por impressora) * (padrão 4 de aumento) vezes + numero de substituições para listar
            //forem maior que o limite adiciona uma nova página e começa a listar a impressora lá
            if ( linha + ( 6 * 4 ) > 276 || ( impressora.adicionaltroca > 0 && linha + ( 4 * ( 7 + impressora.substituindo.length ) ) > 276 ) ) linha = aumentarLinha( pdf, 277, 4 )

            pdf.setFontSize( 12 )
            linha = escrever( `- ${ impressora.modelo } - ${ impressora.serial }`, linha, 4 )
            pdf.setFontSize( 11 )
            linha = escrever( `Setor: ${ impressora.setor } - IP: ${ impressora.ip }`, linha, 4 )

            if ( contadores ) {
                let impressoTotal = contadores.impresso + contadores.adicionaltroca
                linha = escrever( `Contador inicial: ${ contadores.primeiro.dia } de ${ meses[ data.split( '-' )[ 1 ] ] } de ${ data.split( '-' )[ 0 ] } - ${ contadores.primeiro.contador } página${ contadores.primeiro.dia != 1 ? 's' : '' }`, linha, 4 )
                linha = escrever( `Contador final: ${ contadores.ultimo.dia } de ${ meses[ data.split( '-' )[ 1 ] ] } de ${ data.split( '-' )[ 0 ] } - ${ contadores.ultimo.contador } página${ contadores.ultimo.dia != 1 ? 's' : '' }`, linha, 4 )

                if ( contadores.adicionaltroca > 0 ) linha = escrever( `Impressões contabilizadas: ${ contadores.impresso } **+ ${ contadores.adicionaltroca }** página${ impressoTotal != 1 ? 's' : '' }`, linha, 4 )
                if ( contadores.adicionaltroca <= 0 ) linha = escrever( `Impressões contabilizadas: ${ contadores.impresso } página${ impressoTotal != 1 ? 's' : '' }`, linha, 4 )

            } else {
                linha = escrever( `Impressões contabilizadas: 0 páginas`, linha, 4 )
            }

            if ( contadores && cliente.franquia.tipo === 'maquina' ) linha = escrever( `Franquia contratada: ${ impressora.franquia.limite } páginas - Excedentes: ${ contadores.excedentes } página${ contadores.excedentes != 1 ? 's' : '' }`, linha, 4 )
            if ( contadores && impressora.substituindo.length > 0 && contadores.adicionaltroca > 0 ) {

                linha = escrever( '', linha, 1 ) //adiciona espaço em branco
                pdf.setFontSize( 12 )
                linha = escrever( `- Substituindo`, linha, 4 )
                pdf.setFontSize( 10 )

                for ( let serial of impressora.substituindo ) {
                    let troca = cliente.impressoras[ serial ]
                    if ( !troca ) continue
                    let contador = troca.contadores[ data ]
                    if ( !contador ) continue

                    linha = escrever( `${ troca.modelo } - ${ serial } - ${ contador.impresso } página${ contador.impresso != 1 ? 's' : '' } - ${ contador.primeiro.dia } a ${ contador.ultimo.dia } de ${ meses[ data.split( '-' )[ 1 ] ] } - ${ contador.primeiro.contador } a ${ contador.ultimo.contador } páginas`, linha, 4 )
                }
            }
            linha = escrever( '', linha, 4 ) //adiciona espaço em branco
        }
        pdf.save( `${ cliente.razaosocial } - ${ meses[ data.split( '-' )[ 1 ] ] }-${ data.split( '-' )[ 0 ] }.pdf` )
    }

    function handleFocusFranquiaPagina () {
        let number = valorFranquiaPagina.split( ' ' )
        setValorFranquiaPagina( number[ 0 ] )
    }

    function handleDigitarFranquiaPagina ( e ) {
        if ( !isNaN( e.target.value ) ) return setValorFranquiaPagina( e.target.value )
    }

    function handleBlurFranquiaPagina () {
        setObjectData( 'franquia.limite', Number( valorFranquiaPagina ) ) //atualiza o valor no objeto do cliente
        setValorFranquiaPagina( `${ Number( valorFranquiaPagina ) } págs` ) //coloca o 'pags' no valor (visual)
    }

    function handleDigitarVpe ( e ) {
        let value = e.target.value.replace( 'R$', '' ).replace( ',', '.' )
        if ( value.length <= 1 ) { value = '0' + value }
        value = parseFloat( value.replace( /[^\d]/g, '' ).replace( /(\d\d?)$/, '.$1' ) ).toFixed( 2 )

        if ( value.length > 4 ) return
        setVpe( `R$ ${ value.replace( '.', ',' ) }` )
    }

    function handleBlurVpe ( e ) {
        let value = Number( e.target.value.replace( 'R$', '' ).replace( ',', '.' ) )
        setObjectData( 'franquia.vpe', value )
    }

    function handleFranquiaChange ( e ) {

        switch ( e.target.value ) {
            case 'pagina':
                setFranquiaPagina( true )
                setObjectData( 'franquia.tipo', 'pagina' )
                break
            case 'maquina':
                setFranquiaPagina( false )
                setObjectData( 'franquia.tipo', 'maquina' )
                break
            case 'ilimitado':
                setFranquiaPagina( false )
                setObjectData( 'franquia.tipo', 'ilimitado' )
                break
        }
    }

    function setObjectData ( keys, value ) {
        setCliente( recalcularDados( set( keys, value, cliente ) ) )
    }

    function recalcularDados ( cliente ) {
        const data = props.filters.data

        function getDatas () {
            let datas = []
            let data = new Date()
            let ano = data.getFullYear()
            let mes = data.getMonth() + 1

            for ( var x = 0; x < 4; x++ ) {
                datas.push( { value: ano + '-' + ( mes < 10 ? `0${ mes }` : mes ), label: ( mes < 10 ? `0${ mes }` : mes ) + '/' + ano } )

                if ( mes <= 1 ) {
                    mes = 12
                    ano = ano - 1
                } else {
                    mes--
                }
            }
            return datas
        }

        function getDiasPassados ( mes, dia ) {
            let agora = new Date()
            let leitura = new Date( `${ mes }-${ dia }` )

            //se a diferença de dias entre a data da ultima leitura for maior que 5 dias retorna falso
            if ( Math.ceil( Math.abs( agora - leitura ) / ( 1000 * 3600 * 24 ) ) > 5 ) return false
            return true
        }

        //verifica leitura do mes atual e do mes anterior se precisar
        function getMesPassado ( impressora ) {
            let contadores = impressora.contadores[ data ]
            //se o contador do mês for válido e os dias dentro do prazo então está tudo ok
            if ( contadores && getDiasPassados( data, contadores.ultimo.dia ) ) return true

            let split = data.split( '-' )
            let ano = Number( split[ 0 ] )
            let mes = Number( split[ 1 ] ) - 1

            if ( mes < 1 ) ano = ano - 1
            if ( mes < 1 ) mes = 12
            if ( mes < 10 ) mes = `0${ mes }`

            let mesPassado = `${ ano }-${ mes }`
            contadores = impressora.contadores[ mesPassado ]
            //se o contador do mês passado for válido e os dias dentro do prazo então está tudo ok
            if ( contadores && getDiasPassados( mesPassado, contadores.ultimo.dia ) ) return true

            //se os filtros forem diferentes do mês atual
            if ( getDatas()[ 0 ].value != data ) return true

            return false
        }

        cliente.impresso = 0
        cliente.excedentes = 0
        cliente.impressorasAtivas = 0
        cliente.atraso = false
        cliente.abastecimento = false

        let impressorasAtrasadas = 0 //variável de controle de impressoras com atrasos em leituras
        let impressoras = cliente.impressoras
        for ( let serial in impressoras ) {

            let impressora = impressoras[ serial ]
            let contadores = impressora.contadores[ data ]
            let impresso = 0
            if ( !impressora.contabilizar || impressora.substituida || !impressora ) continue //se a impressora estiver substituida, invalida ou não contabilizar pulará para a proxima            
            if ( ( impressora.contador - impressora.tintas.abastecido ) >= impressora.tintas.capacidade ) cliente.abastecimento = true
            if ( !getMesPassado( impressora ) ) impressorasAtrasadas += 1

            cliente.impressorasAtivas += 1

            if ( !contadores ) continue
            //precisa sempre resetar os excedentes dos contadores para evitar bugs ao alterar a franquia no site
            contadores.excedentes = 0
            contadores.adicionaltroca = 0

            if ( impressora.substituindo.length > 0 ) { //essa impressora está substituindo alguma outra?
                for ( let index in impressora.substituindo ) {
                    let serialSubstituido = impressora.substituindo[ index ]
                    let impressoraSubstituida = cliente.impressoras[ serialSubstituido ]

                    if ( !impressoraSubstituida || !impressoraSubstituida.contadores[ data ] ) continue //se a impressora substituida não existir ou não tiver leitura ela será ignorada

                    impresso += impressoraSubstituida.contadores[ data ].impresso //incrementa com o total impresso das maquinas que sairam
                    contadores.adicionaltroca += impressoraSubstituida.contadores[ data ].impresso
                }
            }

            //após definir o valor impresso pelas maquinas que sairam, incrementamos os valores da impressora atual também
            impresso += contadores.impresso
            //definimos se tem excedentes com base na franquia da maquina comparado ao total impresso das trocas + impresso atual
            if ( impresso > impressora.franquia.limite ) contadores.excedentes = impresso - impressora.franquia.limite
            //incrementa o total impresso no controle geral do cliente
            cliente.impresso += impresso

            switch ( cliente.franquia.tipo ) {
                case 'maquina':
                    cliente.excedentes += contadores.excedentes
                    break
                case 'pagina':
                    if ( cliente.impresso > cliente.franquia.limite ) cliente.excedentes = cliente.impresso - cliente.franquia.limite
                    break
                case 'ilimitado':
                    cliente.excedentes = cliente.impresso
                    break
            }
        }
        //se apenas uma impressora apenas estiver com atraso não irá dizer que o sistema não está coletando para esse cliente
        //e não o marcará como um cliente com atraso, mas se o numero de impressoras ativas for igual que o numero de impressoras
        //atrasadas daí sim irá indicar que não está coletandos
        if ( impressorasAtrasadas >= cliente.impressorasAtivas ) cliente.atraso = true

        return cliente
    }

    function renderImpressoras () {
        const data = props.filters.data
        let views = []
        let impressoras = cliente.impressoras

        if ( Object.keys( impressoras ).length <= 0 ) return views

        for ( let serial in impressoras ) {

            let substituindo = []
            let impressora = impressoras[ serial ]
            if ( !impressora.contabilizar || impressora.substituida || !impressora ) continue

            if ( impressora.substituindo.length > 0 ) { //essa impressora está substituindo alguma outra?

                for ( let index in impressora.substituindo ) {
                    let serialSubstituido = impressora.substituindo[ index ]
                    let impressoraSubstituida = cliente.impressoras[ serialSubstituido ]

                    if ( !impressoraSubstituida || !impressoraSubstituida.contadores[ data ] ) continue //se a impressora substituida não existir ou não tiver leitura ela será ignorada
                    substituindo.push( impressoraSubstituida )
                }
            }

            views.push( <Impressoras key={ serial } { ...{ ...props, data, impressora, setObjectData, cliente, rollback, setCliente, recalcularDados } } /> )
        }
        return views
    }

    function compareParentData () {
        return JSON.stringify( props.cliente ) != JSON.stringify( cliente )
    }

    function getFranquia ( tipo ) {
        for ( let franquia of franquias ) {
            if ( franquia.value == tipo ) return franquia.label
        }
    }

    return (
        <S.Container { ...{ show } }>
            <S.Botoes>
                { compareParentData() && <S.Botao onClick={ () => setRollback( true ) } hover={ colors.azul } title='Desfazer'> <MenuIcon name='desfazer' margin='0.8' /> </S.Botao> }
                <S.Botao onClick={ () => gerarRelatorio() } hover={ colors.azul } title='Gerar Relatório'> <MenuIcon name='relatorio' margin='0.8' /> </S.Botao>
                <S.Botao onClick={ () => props.editarCadastros( cliente.id, props.clientes ) } hover={ colors.azul } title='Editar Cliente'> <MenuIcon name='usuario_editar' margin='0.8' /> </S.Botao>
                { compareParentData() && <S.Botao onClick={ () => salvar() } hover={ colors.azul } title='Salvar/Fechar'> <MenuIcon name='salvar' margin='0.8' /> </S.Botao> }
                <S.Botao onClick={ () => fechar() } hover={ colors.azul } title='Fechar'> <MenuIcon name='fechar' margin='0' /> </S.Botao>
            </S.Botoes>
            <S.TituloContainer>
                <S.TituloSubContainer>
                    <S.Titulo>{ cliente.nomefantasia }</S.Titulo>
                    <S.Subtitulo>{ cliente.razaosocial }</S.Subtitulo>
                </S.TituloSubContainer>
                <S.TituloSubContainer>
                    <S.DadosColetor>Chave do cliente: <b> { cliente.id } </b></S.DadosColetor>
                    <S.DadosColetor>Pc com coletor: <b> { window.atob( cliente.sistema.local ) } </b></S.DadosColetor>
                    <S.DadosColetor>Versão do coletor: <b>  { cliente.sistema.versao } </b></S.DadosColetor>
                </S.TituloSubContainer>
            </S.TituloContainer>
            <S.Listagem>
                <S.FranquiaContainer>
                    <S.FranquiaSubcontainer border={ props.user.permissoes.clientes.financeiro }>
                        <S.FranquiaItem>
                            <S.FranquiaTitulo> Tipo de franquia </S.FranquiaTitulo>
                            <S.FranquiaDado>
                                { props.user.permissoes.clientes.financeiro && <Select valor={ cliente.franquia.tipo } options={ franquias } onChange={ handleFranquiaChange } /> }
                                { !props.user.permissoes.clientes.financeiro && getFranquia( cliente.franquia.tipo ) }
                            </S.FranquiaDado>
                        </S.FranquiaItem>
                        <S.FranquiaItem show={ franquiaPagina }>
                            <S.FranquiaTitulo> Franquia </S.FranquiaTitulo>
                            <S.FranquiaDado>
                                <TextField onChange={ handleDigitarFranquiaPagina } value={ valorFranquiaPagina } onFocus={ handleFocusFranquiaPagina } onBlur={ handleBlurFranquiaPagina } />
                            </S.FranquiaDado>
                        </S.FranquiaItem>
                        <S.FranquiaItem border={ false }>
                            <S.FranquiaTitulo> Total impresso </S.FranquiaTitulo>
                            <S.FranquiaDado> { cliente.impresso } págs </S.FranquiaDado>
                        </S.FranquiaItem>
                    </S.FranquiaSubcontainer>
                    { props.user.permissoes.clientes.financeiro && <S.FranquiaSubcontainer border={ false }>
                        <S.FranquiaItem>
                            <S.FranquiaTitulo> Valor por excedente </S.FranquiaTitulo>
                            <S.FranquiaDado>
                                <TextField onChange={ handleDigitarVpe } value={ vpe } onBlur={ handleBlurVpe } />
                            </S.FranquiaDado>
                        </S.FranquiaItem>
                        <S.FranquiaItem border={ false } bottom={ false }>
                            <S.FranquiaTitulo> Excedentes </S.FranquiaTitulo>
                            <S.FranquiaDado>
                                { cliente.excedentes } págs - { ( cliente.franquia.vpe * cliente.excedentes ).toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) }
                            </S.FranquiaDado>
                        </S.FranquiaItem>
                    </S.FranquiaSubcontainer> }
                </S.FranquiaContainer>

                { !rollback && renderImpressoras() }
            </S.Listagem>
        </S.Container>
    )
}

export default memo( Expandido )