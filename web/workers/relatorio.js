import { jsPDF } from 'jspdf'
import { bg, font } from '../hooks/useRelatorio'

export async function gerarRelatorio ( cadastro, filtros, colors ) {
    const data = filtros.data
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
    pdf.text( getOffset( cadastro.razaosocial ), 80, cadastro.razaosocial )
    pdf.setFontSize( 14 )
    linha = escrever( `Relatório mensal de impressões - ${ meses[ data.split( '-' )[ 1 ] ] } de ${ data.split( '-' )[ 0 ] }`, linha, 6, true )
    pdf.setFontSize( 12 )

    switch ( cadastro.franquia.tipo ) {
        case 'pagina':
            linha = escrever( `Franquia contratada: ${ cadastro.franquia.limite } páginas - Impressões contabilizadas: ${ cadastro.impresso } página${ cadastro.impresso != 1 ? 's' : '' }`, linha, 5, true )
            pdf.setFontSize( 11 )
            if ( cadastro.excedenteadicional <= 0 ) linha = escrever( `Valor por excedente: ${ cadastro.franquia.vpe.toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) } - Excedentes totais: ${ cadastro.excedentes } página${ cadastro.excedentes != 1 ? 's' : '' } - Valor dos excedentes: ${ ( cadastro.franquia.vpe * cadastro.excedentes ).toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) }`, linha, 5, true )
            if ( cadastro.excedenteadicional > 0 ) linha = escrever( `Valor por excedente: ${ cadastro.franquia.vpe.toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) } - Excedentes totais: ${ cadastro.excedentes } **+ ${ cadastro.excedenteadicional }** página${ cadastro.excedentes != 1 ? 's' : '' } - Valor dos excedentes: ${ ( cadastro.franquia.vpe * ( cadastro.excedentes + cadastro.excedenteadicional ) ).toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) }`, linha, 5, true )
            pdf.setFontSize( 12 )
            break
        case 'maquina':
            if ( cadastro.excedenteadicional <= 0 ) linha = escrever( `Impressões contabilizadas: ${ cadastro.impresso } páginas - Excedentes totais: ${ cadastro.excedentes } página${ cadastro.excedentes != 1 ? 's' : '' }`, linha, 5, true )
            if ( cadastro.excedenteadicional > 0 ) linha = escrever( `Impressões contabilizadas: ${ cadastro.impresso } páginas - Excedentes totais: ${ cadastro.excedentes } **+ ${ cadastro.excedenteadicional }** página${ cadastro.excedentes != 1 ? 's' : '' }`, linha, 5, true )
            if ( cadastro.excedenteadicional <= 0 ) linha = escrever( `Valor por excedente: ${ cadastro.franquia.vpe.toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) } - Valor dos excedentes: ${ ( cadastro.franquia.vpe * cadastro.excedentes ).toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) }`, linha, 5, true )
            if ( cadastro.excedenteadicional > 0 ) linha = escrever( `Valor por excedente: ${ cadastro.franquia.vpe.toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) } - Valor dos excedentes: ${ ( cadastro.franquia.vpe * ( cadastro.excedentes + cadastro.excedenteadicional ) ).toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) }`, linha, 5, true )
            break
        case 'ilimitado':
            linha = escrever( `Impressões contabilizadas: ${ cadastro.impresso } página${ cadastro.impresso != 1 ? 's' : '' } - Valor por página: ${ cadastro.franquia.vpe.toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) } - Valor total: ${ ( cadastro.franquia.vpe * cadastro.impresso ).toLocaleString( 'pt-br', { style: 'currency', currency: 'BRL' } ) }`, linha, 5, true )
            break
    }

    linha = escrever( '', linha, 5 ) //adiciona espaço em branco
    for ( let serial in cadastro.impressoras ) {
        let impressora = cadastro.impressoras[ serial ]
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

        if ( contadores && cadastro.franquia.tipo === 'maquina' && contadores.excedenteadicional <= 0 ) linha = escrever( `Franquia contratada: ${ impressora.franquia.limite } páginas - Excedentes: ${ contadores.excedentes } página${ contadores.excedentes != 1 ? 's' : '' }`, linha, 4 )
        if ( contadores && cadastro.franquia.tipo === 'maquina' && contadores.excedenteadicional > 0 ) linha = escrever( `Franquia contratada: ${ impressora.franquia.limite } páginas - Excedentes: ${ contadores.excedentes } **+ ${ contadores.excedenteadicional }** página${ contadores.excedentes != 1 ? 's' : '' }`, linha, 4 )
        if ( contadores && impressora.substituindo.length > 0 && contadores.adicionaltroca > 0 ) {

            linha = escrever( '', linha, 1 ) //adiciona espaço em branco
            pdf.setFontSize( 12 )
            linha = escrever( `- Substituindo`, linha, 4 )
            pdf.setFontSize( 10 )

            for ( let serial of impressora.substituindo ) {
                let troca = cadastro.impressoras[ serial ]
                if ( !troca ) continue
                let contador = troca.contadores[ data ]
                if ( !contador ) continue

                linha = escrever( `${ troca.modelo } - ${ serial } - ${ contador.impresso } página${ contador.impresso != 1 ? 's' : '' } - ${ contador.primeiro.dia } a ${ contador.ultimo.dia } de ${ meses[ data.split( '-' )[ 1 ] ] } - ${ contador.primeiro.contador } a ${ contador.ultimo.contador } páginas`, linha, 4 )
            }
        }
        linha = escrever( '', linha, 4 ) //adiciona espaço em branco
    }
    pdf.save( `${ cadastro.razaosocial } - ${ meses[ data.split( '-' )[ 1 ] ] }-${ data.split( '-' )[ 0 ] }.pdf` )
}